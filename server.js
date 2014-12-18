var express = require('express')
, bodyParser = require('body-parser')
, query = require('./query.js')
, command = require('./command.js')

var app = express()
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

var mongoskin = require('mongoskin')
var db = mongoskin.db('mongodb://@localhost:27017/db', {safe:true})

app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName)
  next()
})

app.route('/')
.all(query.usage)

app.route('/colls')
.get(query.getCollections)
.post(command.createCollection)

app.route('/colls/:collectionName')
.get(query.top10)
.post(command.insert)

app.route('/colls/:collectionName/:id')
.get(query.findById)
.put(command.updateById)
.delete(command.deleteById)

// the first parameter is port
app.listen(process.argv[2])
