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

app.route('/')
.all(query.usage)

app.route('/cols')
.get(query.getCollections)

app.route('/cols/:colName')
.post(command.createCollection)
.delete(command.deleteCollection)
.put(command.renameCollection)

app.route('/cols/:colName/docs')
.get(query.getTop100Docs)
.post(command.insertDocs)

app.route('/cols/:colName/docs/:id')
.get(query.findById)
.put(command.updateById)
.delete(command.deleteById)

app.route('/cols/:colName/all')
.post(query.getAll)

app.route('/cols/:colName/all/:limit')
.post(query.getAllWithLimit)

app.route('/cols/:colName/next')
.post(query.getNext)

app.route('/cols/:colName/next/:batchSize')
.post(query.getNextBatch)

// the first parameter is port
app.listen(process.argv[2])
