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
  getAllInternal(req, res, next, 1000)
}

module.exports.getAllWithLimit = function(req, res, next) {
  getAllInternal(req, res, next, parseInt(req.params.limit))
}

function getAllInternal(req, res, next, max) {
  req.collection.find(req.body, {limit:max, sort: [['_id', -1]]}).toArray(function(e, results){
    res.send(results)
    next()
  })
}

module.exports.getNext = function(req, res, next) {
  getNextInternal(req, res, next, 1)
}

module.exports.getNextBatch = function(req, res, next) {
  getNextInternal(req, res, next, parseInt(req.params.batchSize))
}

function getNextInternal(req, res, next, size) {
  var sess = req.session
  var cursor
  if (!sess.previousQuery ||
    JSON.stringify(sess.previousQuery) != JSON.stringify(req.body)) {
    sess.previousQuery = req.body
    sess.skipToken = 0
  }

  cursor = req.collection.find(req.body, {limit: size, skip: sess.skipToken, sort: [['_id', -1]]}).toArray(function(e, results) {
    res.send(results)
    next()
  })

  sess.skipToken += size
}

module.exports.reset = function(req, res, next) {
  var sess = req.session
  sess.skipToken = 0
  res.send((sess.skipToken === 0)?{msg:'success'}:{msg:'error'})
}

module.exports.countAllDocs = function(req, res, next) {
  var sess = req.session
  var cursor = req.collection.find({}).count(function(e, cnt){
    res.send({count: cnt})
    next()
  })
}

module.exports.countDocs = function(req, res, next) {
  var sess = req.session
  var cursor = req.collection.find(req.body).count(function(e, cnt){
    res.send({count: cnt})
    next()
  })
}

module.exports.max = function(req, res, next) {
  maxInternal(req, res, next, req.params.propName, req.params.groupByName)
}

function maxInternal(req, res, next, prop, groupby) {
  var map = function(){
    var content = {value: this.v, _id: this._id}
    emit(this[group], {max: content})
  }

  var reduce = function(key, values){
    var result = values[0]
    for (var i = 1; i < values.length; i++) {
      if (values[i].max.value > result.max.value) {
        result.max = values[i].max;
      }
    }
    return result
  }

  req.collection.mapReduce(map, reduce, {scope: {property: prop, group: groupby}, out: {replace : 'replaceThisCollection'}}, function(e, outCollection) {
    if (e) {
      console.log(e)
    }
    outCollection.find().toArray(function(e, results) {
      res.send(results)
      next()
    })
  })
}

module.exports.min = function(req, res, next) {
  minInternal(req, res, next, req.params.propName, req.params.groupByName)
}

function minInternal(req, res, next, prop, groupby) {
  var map = function(){
    var content = {value: this.v, _id: this._id}
    emit(this[group], {min: content})
  }

  var reduce = function(key, values){
    var result = values[0]
    for (var i = 1; i < values.length; i++) {
      if (values[i].min.value < result.min.value) {
        result.min = values[i].min;
      }
    }
    return result
  }

  req.collection.mapReduce(map, reduce, {scope: {property: prop, group: groupby}, out: {replace : 'replaceThisCollection'}}, function(e, outCollection) {
    if (e) {
      console.log(e)
    }
    outCollection.find().toArray(function(e, results) {
      res.send(results)
      next()
    })
  })
}
