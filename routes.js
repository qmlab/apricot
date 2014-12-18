var express = require('express')
, bodyParser = require('body-parser')
, session = require('express-session')
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

var mongoskin = require('mongoskin')
var db = mongoskin.db('mongodb://@localhost:27017/db', {safe:true})

app.param('colName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName)
  next()
})

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
app.route('/col/:colName/docs')
.get(query.getTop100Docs)
.post(command.insertDocs)

// Single-doc operations
// GET - find doc by Id
// PUT - replace entire doc by Id
// DELETE - delete doc by Id
app.route('/col/:colName/byid/:id')
.get(query.findById)
.put(command.updateById)
.delete(command.deleteById)

// Get all records as array of a maximum of 1000 records
app.route('/col/:colName/all')
.post(query.getAll)

// Get all records as array of a maximum of N records
app.route('/col/:colName/all/:limit')
.post(query.getAllWithLimit)

// Get the next record for the query
app.route('/col/:colName/next')
.post(query.getNext)

// Get the next N records for the query
app.route('/col/:colName/next/:batchSize')
.post(query.getNextBatch)

// Reset the cursor for the session
app.route('/reset')
.all(query.reset)

// Count the number of documents
// GET - get count of all documents in a collection
// POST - get the count of the query results
app.route('/col/:colName/count')
.get(query.countAllDocs)
.post(query.countDocs)

// Get the max/min of a property (optionally groupby a category)
app.route('/col/:colName/max/:propName')
.post(query.max)

app.route('/col/:colName/max/:propName/groupby/:groupByName')
.post(query.max)

app.route('/col/:colName/min/:propName')
.post(query.min)

app.route('/col/:colName/min/:propName/groupby/:groupByName')
.post(query.min)

// the first parameter is port
app.listen(process.argv[2])
