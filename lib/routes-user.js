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
  var readAuth
  var writeAuth
  if (nconf.get('server:auth') === 'digest') {
    userAuth= passport.authenticate('digest-user', { session : false })
    readAuth= passport.authenticate('digest-user-read', { session : false })
    writeAuth= passport.authenticate('digest-user-write', { session : false })
  }
  else if (nconf.get('server:auth') === 'basic') {
    userAuth = passport.authenticate('basic-user', { session : false })
    readAuth = passport.authenticate('basic-user-read', { session : false })
    writeAuth = passport.authenticate('basic-user-write', { session : false })
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
    req.collection = req.db.collection(collectionName)
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
  router.route('/sets')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:cols'), setHeaders: true}), readAuth, query.getCollections)

  // Collection operations
  // POST - create collection
  // DELETE - delete collection
  // PUT - rename collection
  router.route('/set/:colName')
  .post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:col:post'), setHeaders: true}), writeAuth, command.createCollection)
  .delete(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:col:delete'), setHeaders: true}), writeAuth, command.deleteCollection)
  .put(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:col:put'), setHeaders: true}), writeAuth, command.renameCollection)

  // File operations
  // GET - list all files in the collection
  // POST - query files
  router.route('/set/:colName/files')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:files:get'), setHeaders: true}), readAuth, fileController.listFiles)
  .post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:files:post'), setHeaders: true}), readAuth, fileController.listFiles)

  // Single-file operations
  // GET - download a file
  // POST - upload a file
  // DELETE - delete a file
  router.route('/set/:colName/file/:fileName')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:file:get'), setHeaders: true}), readAuth, fileController.readFile)
  .post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:file:post'), setHeaders: true}), writeAuth, fileController.writeFile)
  .delete(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:file:delete'), setHeaders: true}), writeAuth, fileController.deleteFile)

  // Multi-doc operations
  // GET - get docs
  // POST - query docs
  // PUT - insert docs
  // PATCH - partially update docs. req.body[0] is search pattern and req.body[1] is patching action
  // DELETE - delete docs. (optionally by a query as req.body)
  router.route('/set/:colName/items')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:get'), setHeaders: true}), readAuth, query.getDocs)
  .post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:get'), setHeaders: true}), readAuth, query.getDocs)
  .put(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:post'), setHeaders: true}), writeAuth, command.insertDocs)
  .patch(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:patch'), setHeaders: true}), writeAuth, command.patchDocs)
  .delete(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:delete'), setHeaders: true}), writeAuth, command.deleteDocs)

  // Single-doc operations
  // GET - find doc by Id
  // POST - insert item by Id
  // PUT - replace entire doc by Id
  // DELETE - delete doc by Id
  router.route('/set/:colName/item/:id')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:doc:get'), setHeaders: true}), readAuth, query.findById)
  .post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:doc:post'), setHeaders: true}), writeAuth, command.insertById)
  .put(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:doc:put'), setHeaders: true}), writeAuth, command.updateById)
  .delete(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:doc:delete'), setHeaders: true}), writeAuth, command.deleteById)

  // Get the next record(s) for the query
  router.route('/set/:colName/next')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:next:get'), setHeaders: true}), readAuth, query.getNext)
  .post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:next:post'), setHeaders: true}), readAuth, query.getNext)

  // Geo-location operations
  // GET - get all locations
  // POST - query locations
  // PUT - insert locations
  // PATCH - partially update locations
  // DELETE - delete locations
  router.route('/set/:colName/places')
  .get(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:get'), setHeaders: true}), readAuth, query.getPlaces)
  .post(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:get'), setHeaders: true}), readAuth, query.getPlaces)
  .put(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:post'), setHeaders: true}), writeAuth, command.insertPlaces)
  .patch(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:patch'), setHeaders: true}), writeAuth, command.patchPlaces)
  .delete(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:docs:delete'), setHeaders: true}), writeAuth, command.deletePlaces)

  // Reset the cursor for the session
  router.route('/reset')
  .all(rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:next:post'), setHeaders: true}), readAuth, query.reset)

  var aggGetRateLimit = rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:agg:get'), setHeaders: true})
  var aggPostRateLimit = rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:agg:get'), setHeaders: true})

  // Count the number of documents (optionally groupby a category)
  // GET - get count of all documents in a collection
  // POST - get the count of the query results
  router.route('/set/:colName/count')
  .get(aggGetRateLimit, readAuth, query.count)
  .post(aggPostRateLimit, readAuth, query.count)

  // Get the max/min of a property (optionally groupby a category)
  // GET - calculate upon all docs
  // POST - calculate upon the query results
  router.route('/set/:colName/max')
  .get(aggGetRateLimit, readAuth, query.max)
  .post(aggPostRateLimit, readAuth, query.max)

  router.route('/set/:colName/min')
  .get(aggGetRateLimit, readAuth, query.min)
  .post(aggPostRateLimit, readAuth, query.min)

  // Get the sum/avg the field of documents (optionally groupby a category)
  // GET - calculate upon all docs
  // POST - calculate upon the query results
  router.route('/set/:colName/sum')
  .get(aggGetRateLimit, readAuth, query.sum)
  .post(aggPostRateLimit, readAuth, query.sum)

  router.route('/set/:colName/avg')
  .get(aggGetRateLimit, readAuth, query.avg)
  .post(aggPostRateLimit, readAuth, query.avg)

  return router
}
