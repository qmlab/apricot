var mongoskin = require('mongoskin')
var db = mongoskin.db('mongodb://@localhost:27017/db', {safe:true})
var cursors = {}

module.exports.usage = function(req, res, next) {
  res.send('please select a collection, e.g., /colls/msgs')
}

module.exports.getTop100Docs = function(req, res, next) {
  req.collection.find({} ,{limit:100, sort: [['_id',-1]]}).toArray(function(e, results){
    res.send(results)
    next()
  })
}

module.exports.findById = function(req, res, next) {
  req.collection.findById(req.params.id, function(e, result){
    res.send(result)
    next()
  })
}

module.exports.getCollections = function(req, res, next) {
  db.collectionNames(function(err, items) {
    res.send(items)
    next()
  })
}

module.exports.getAll = function(req, res, next) {
  req.collection.find(req.body, {sort: [['_id', -1]]}).toArray(function(e, results){
    res.send(results)
    next()
  })
}

module.exports.getAllWithLimit = function(req, res, next) {
  req.collection.find(req.body, {limit:req.params.limit, sort: [['_id', -1]]}).toArray(function(e, results){
    res.send(results)
    next()
  })
}

module.exports.getNext = function(req, res, next) {
}
