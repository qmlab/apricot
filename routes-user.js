var query = require('./controllers/query.js')
, command = require('./controllers/command.js')
, userController = require('./controllers/user.js')
, authController = require('./controllers/auth.js')
, fileController = require('./controllers/file.js')
, passport = require('passport')
, mongo = require('mongodb')
, rate = require('express-rate')
, mongoskin = require('mongoskin')

module.exports = function() {
  var userAuth
  if (nconf.get('server:auth') === 'digest') {
    userAuth= passport.authenticate('digest-user', { session : false })
  }
  else if (nconf.get('server:auth') === 'basic') {
    userAuth = passport.authenticate('basic-user', { session : false })
  }
  else {
    console.error('unrecognized auth')
  }
  var router = express.Router()
  var handler = new rate.Memory.MemoryRateHandler()

  router.all('*', userAuth, function(req, res, next) {
    if (req.user) {
      mongoClient = mongo.MongoClient
      mongoClient.connect(nconf.get('db:mongourl') + '-' + req.user.username, function(err, db) {
        if(!err) {
          req.db = db
      }
        else {
          console.error(err)
        }
        next()
      });
    }
  })

  router.param('colName', function(req, res, next, collectionName){
    req.collection = mongoskin.db(nconf.get('db:mongourl') + '-' + req.user.username, {native_parser:true}).collection(collectionName)
    next()
  })

  // General query parameters:
  // page=N - start from Nth page
  // per_page=M - show M records in the response
  // prop=P - the property name to aggregate on
  // groupby=G - the property name to group by in aggregation

  // Show usage
  router.route('/')
  .all(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:manual'), setHeaders: true}), query.usage)

  // Show all collections
  router.route('/cols')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:cols'), setHeaders: true}), query.getCollections)

  // Collection operations
  // POST - create collection
  // DELETE - delete collection
  // PUT - rename collection
  router.route('/col/:colName')
  .post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:col:post'), setHeaders: true}), command.createCollection)
  .delete(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:col:delete'), setHeaders: true}), command.deleteCollection)
  .put(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:col:put'), setHeaders: true}), command.renameCollection)

  // File operations
  // GET - list all files in the collection
  router.route('/col/:colName/files')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:files:get'), setHeaders: true}), fileController.listFiles)
  .post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:files:post'), setHeaders: true}), fileController.listFiles)

  // Single-file operations
  // GET - download a file
  // POST - upload a file
  // DELETE - delete a file
  router.route('/col/:colName/file/:fileName')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:file:get'), setHeaders: true}), fileController.readFile)
  .post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:file:post'), setHeaders: true}), fileController.writeFile)
  .delete(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:file:delete'), setHeaders: true}), fileController.deleteFile)

  // Multi-doc operations
  // GET - get docs
  // POST - query docs
  // PUT - insert docs
  // PATCH - partially update docs. req.body[0] is search pattern and req.body[1] is patching action
  // DELETE - delete docs. (optionally by a query as req.body)
  router.route('/col/:colName/docs')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:get'), setHeaders: true}), query.getDocs)
  .post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:get'), setHeaders: true}), query.getDocs)
  .put(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:post'), setHeaders: true}), command.insertDocs)
  .patch(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:patch'), setHeaders: true}), command.patchDocs)
  .delete(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:delete'), setHeaders: true}), command.deleteDocs)

  // Single-doc operations
  // GET - find doc by Id
  // PUT - replace entire doc by Id
  // DELETE - delete doc by Id
  router.route('/col/:colName/doc/:id')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:doc:get'), setHeaders: true}), query.findById)
  //.post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:doc:post'), setHeaders: true}), command.insertById)
  .put(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:doc:put'), setHeaders: true}), command.updateById)
  .delete(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:doc:delete'), setHeaders: true}), command.deleteById)

  // Get the next record(s) for the query
  router.route('/col/:colName/next')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:next:get'), setHeaders: true}), query.getNext)
  .post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:next:post'), setHeaders: true}), query.getNext)

  // Reset the cursor for the session
  router.route('/reset')
  .all(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:next:post'), setHeaders: true}), query.reset)

  var aggGetRateLimit = rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:agg:get'), setHeaders: true})
  var aggPostRateLimit = rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:agg:get'), setHeaders: true})

  // Count the number of documents (optionally groupby a category)
  // GET - get count of all documents in a collection
  // POST - get the count of the query results
  router.route('/col/:colName/count')
  .get(aggGetRateLimit, query.count)
  .post(aggPostRateLimit, query.count)

  // Get the max/min of a property (optionally groupby a category)
  // GET - calculate upon all docs
  // POST - calculate upon the query results
  router.route('/col/:colName/max')
  .get(aggGetRateLimit, query.max)
  .post(aggPostRateLimit, query.max)

  router.route('/col/:colName/min')
  .get(aggGetRateLimit, query.min)
  .post(aggPostRateLimit, query.min)

  // Get the sum/avg the field of documents (optionally groupby a category)
  // GET - calculate upon all docs
  // POST - calculate upon the query results
  router.route('/col/:colName/sum')
  .get(aggGetRateLimit, query.sum)
  .post(aggPostRateLimit, query.sum)

  router.route('/col/:colName/avg')
  .get(aggGetRateLimit, query.avg)
  .post(aggPostRateLimit, query.avg)

  return router
}
