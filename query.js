var mongoskin = require('mongoskin')
var db = mongoskin.db('mongodb://@localhost:27017/db', {safe:true})

module.exports.usage = function(req, res, next) {
  res.send('please select a collection, e.g., /colls/msgs')
}

module.exports.top10 = function(req, res, next) {
  req.collection.find({} ,{limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
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
