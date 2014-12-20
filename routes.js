var query = require('./controllers/query.js')
, command = require('./controllers/command.js')
, userController = require('./controllers/user.js')
, authController = require('./controllers/auth.js')
, passport = require('passport')

module.exports = function() {
  var router = express.Router()
  router.param('colName', function(req, res, next, collectionName){
    req.collection = db.collection(collectionName)
    next()
  })

  // General query parameters:
  // page=N - start from Nth page
  // per_page=M - show M records in the response
  // prop=P - the property name to aggregate on
  // groupby=G - the property name to group by in aggregation

  // Show usage
  router.route('/')
  .all(authController.isAuthenticated, query.usage)

  // Show all collections
  router.route('/cols')
  .get(authController.isAuthenticated, query.getCollections)

  // Collection operations
  // POST - create collection
  // DELETE - delete collection
  // PUT - rename collection
  router.route('/col/:colName')
  .post(authController.isAuthenticated, command.createCollection)
  .delete(authController.isAuthenticated, command.deleteCollection)
  .put(authController.isAuthenticated, command.renameCollection)

  // Multi-doc operations
  // GET - get docs
  // POST - insert docs
  // PATCH - partially update docs. req.body[0] is search pattern and req.body[1] is patching action
  // DELETE - delete docs. (optionally by a query as req.body)
  router.route('/col/:colName/docs')
  .get(authController.isAuthenticated, query.getDocs)
  .post(authController.isAuthenticated, command.insertDocs)
  .patch(authController.isAuthenticated, command.patchDocs)
  .delete(authController.isAuthenticated, command.deleteDocs)

  // Single-doc operations
  // GET - find doc by Id
  // PUT - replace entire doc by Id
  // DELETE - delete doc by Id
  router.route('/col/:colName/doc/:id')
  .get(authController.isAuthenticated, query.findById)
  .put(authController.isAuthenticated, command.updateById)
  .delete(authController.isAuthenticated, command.deleteById)

  // Get the next record(s) for the query
  router.route('/col/:colName/next')
  .get(authController.isAuthenticated, query.getNext)
  .post(authController.isAuthenticated, query.getNext)

  // Reset the cursor for the session
  router.route('/reset')
  .all(authController.isAuthenticated, query.reset)

  // Count the number of documents (optionally groupby a category)
  // GET - get count of all documents in a collection
  // POST - get the count of the query results
  router.route('/col/:colName/count')
  .get(authController.isAuthenticated, query.count)
  .post(authController.isAuthenticated, query.count)

  // Get the max/min of a property (optionally groupby a category)
  // GET - calculate upon all docs
  // POST - calculate upon the query results
  router.route('/col/:colName/max')
  .get(authController.isAuthenticated, query.max)
  .post(authController.isAuthenticated, query.max)

  router.route('/col/:colName/min')
  .get(authController.isAuthenticated, query.min)
  .post(authController.isAuthenticated, query.min)

  // Get the sum/avg the field of documents (optionally groupby a category)
  // GET - calculate upon all docs
  // POST - calculate upon the query results
  router.route('/col/:colName/sum')
  .get(authController.isAuthenticated, query.sum)
  .post(authController.isAuthenticated, query.sum)

  router.route('/col/:colName/avg')
  .get(authController.isAuthenticated, query.avg)
  .post(authController.isAuthenticated, query.avg)

  // Create endpoint handlers for /users
  router.route('/users')
  .post(userController.postUsers)
  .get(authController.isAuthenticated, userController.getUsers)

  return router
}
