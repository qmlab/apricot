var express = require('express')
, bodyParser = require('body-parser')
, session = require('express-session')
, compress = require('compression')
, query = require('./query.js')
, command = require('./command.js')

var app = express()
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(session({
  secret: 'fruit lover',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 }
}))
app.use(compress())

var mongoskin = require('mongoskin')
var db = mongoskin.db('mongodb://@localhost:27017/db', {safe:true})

app.param('colName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName)
  next()
})

// General query parameters:
// page=N - start from Nth page
// per_page=M - show M records in the response
// prop=P - the property name to aggregate on
// groupby=G - the property name to group by in aggregation

// Show usage
app.route('/')
.all(query.usage)

// Show all collections
app.route('/cols')
.get(query.getCollections)

// Collection operations
// POST - create collection
// DELETE - delete collection
// PUT - rename collection
app.route('/col/:colName')
.post(command.createCollection)
.delete(command.deleteCollection)
.put(command.renameCollection)

// Multi-doc operations
// GET - get top 100 docs
// POST - insert docs
// PATCH - update docs. req.body[0] is search pattern and req.body[1] is patching action
app.route('/col/:colName/docs')
.get(query.getAll)
.post(command.insertDocs)
.patch(command.patchDocs)

// Single-doc operations
// GET - find doc by Id
// PUT - replace entire doc by Id
// DELETE - delete doc by Id
app.route('/col/:colName/doc/:id')
.get(query.findById)
.put(command.updateById)
.delete(command.deleteById)

// Get the next record(s) for the query
app.route('/col/:colName/next')
.get(query.getNext)
.post(query.getNext)

// Reset the cursor for the session
app.route('/reset')
.get(query.reset)
.post(query.reset)

// Count the number of documents
// GET - get count of all documents in a collection
// POST - get the count of the query results
app.route('/col/:colName/count')
.get(query.countDocs)
.post(query.countDocs)

// Get the max/min of a property (optionally groupby a category)
// GET - calculate upon all docs
// POST - calculate upon the query results
app.route('/col/:colName/max')
.get(query.max)
.post(query.max)

app.route('/col/:colName/min')
.get(query.min)
.post(query.min)

// the first parameter is port
app.listen(process.argv[2])
