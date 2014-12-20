var query = require('./query.js')
, command = require('./command.js')

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
  .all(query.usage)

  // Show all collections
  router.route('/cols')
  .get(query.getCollections)

  // Collection operations
  // POST - create collection
  // DELETE - delete collection
  // PUT - rename collection
  router.route('/col/:colName')
  .post(command.createCollection)
  .delete(command.deleteCollection)
  .put(command.renameCollection)

  // Multi-doc operations
  // GET - get docs
  // POST - insert docs
  // PATCH - partially update docs. req.body[0] is search pattern and req.body[1] is patching action
  // DELETE - delete docs. (optionally by a query as req.body)
  router.route('/col/:colName/docs')
  .get(query.getDocs)
  .post(command.insertDocs)
  .patch(command.patchDocs)
  .delete(command.deleteDocs)

  // Single-doc operations
  // GET - find doc by Id
  // PUT - replace entire doc by Id
  // DELETE - delete doc by Id
  router.route('/col/:colName/doc/:id')
  .get(query.findById)
  .put(command.updateById)
  .delete(command.deleteById)

  // Get the next record(s) for the query
  router.route('/col/:colName/next')
  .get(query.getNext)
  .post(query.getNext)

  // Reset the cursor for the session
  router.route('/reset')
  .all(query.reset)

  // Count the number of documents (optionally groupby a category)
  // GET - get count of all documents in a collection
  // POST - get the count of the query results
  router.route('/col/:colName/count')
  .get(query.count)
  .post(query.count)

  // Get the max/min of a property (optionally groupby a category)
  // GET - calculate upon all docs
  // POST - calculate upon the query results
  router.route('/col/:colName/max')
  .get(query.max)
  .post(query.max)

  router.route('/col/:colName/min')
  .get(query.min)
  .post(query.min)

  // Get the sum/avg the field of documents (optionally groupby a category)
  // GET - calculate upon all docs
  // POST - calculate upon the query results
  router.route('/col/:colName/sum')
  .get(query.sum)
  .post(query.sum)

  router.route('/col/:colName/avg')
  .get(query.avg)
  .post(query.avg)

  return router
}
