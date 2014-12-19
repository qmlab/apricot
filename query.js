var mongoskin = require('mongoskin')
var db = mongoskin.db('mongodb://@localhost:27017/db', {safe:true})
var cursors = {}

module.exports.usage = function(req, res, next) {
  res.send('please select a collection, e.g., /colls/msgs')
}

module.exports.findById = function(req, res, next) {
  req.collection.findById(req.params.id, function(e, result){
    res.send(result)
    next()
  })
}

function pageResult(results, page, perPage) {
  var start = getStart(page, perPage)
  var end = getEnd(page, perPage)
  return results.slice(start, end)
}

function getStart(page, perPage) {
  var _page = page
  var _perPage = perPage
  if (!page) {
    _page = 1
  }
  if (!perPage) {
    _perPage = 1000
  }
  return parseInt(_page - 1) * _perPage
}

function getEnd(page, perPage) {
  var _page = page
  var _perPage = perPage
  if (!page) {
    _page = 1
  }
  if (!perPage) {
    _perPage = 1000
  }
  return parseInt(_page) * _perPage
}

module.exports.getCollections = function(req, res, next) {
  db.collectionNames(function(err, items) {
    res.send(pageResult(items, req.query.page, req.query.per_page))
    next()
  })
}

module.exports.getDocs = function(req, res, next) {
  var start = getStart(req.query.page, req.query.per_page)
  var max = req.query.per_page
  req.collection.find(req.body, {skip:start, limit:max, sort: [['_id', -1]]}).toArray(function(e, results){
    res.send(results)
    next()
  })
}

module.exports.getNext = function(req, res, next) {
  var size = 1
  if (req.query.per_page) {
    size = parseInt(req.query.per_page)
  }

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

module.exports.count = function(req, res, next) {
  var map = function() {
    emit(this[group], 1)
  }

  var reduce = function(key, values){
    return Array.sum(values)
  }

  aggInternal(req, res, next, map, reduce, req.query.prop, req.query.groupby)
}

module.exports.sum = function(req, res, next) {
  var map = function() {
    emit(this[group], this[property])
  }

  var reduce = function(key, values) {
    return Array.sum(values)
  }

  aggInternal(req, res, next, map, reduce, req.query.prop, req.query.groupby)
}

module.exports.avg = function(req, res, next) {
  var map = function() {
    emit(this[group], this[property])
  }

  var reduce = function(key, values) {
    return values.length != 0 ? Array.sum(values) / values.length : 0
  }

  aggInternal(req, res, next, map, reduce, req.query.prop, req.query.groupby)
}

module.exports.max = function(req, res, next) {
  var map = function(){
    var content = {max: this[property], _id: this._id}
    emit(this[group], content)
  }

  var reduce = function(key, values){
    var result = values[0]
    for (var i = 1; i < values.length; i++) {
      if (values[i].value > result.value) {
        result = values[i];
      }
    }
    return result
  }

  aggInternal(req, res, next, map, reduce, req.query.prop, req.query.groupby)
}

module.exports.min = function(req, res, next) {
  var map = function(){
    var content = {min: this[property], _id: this._id}
    emit(this[group], content)
  }

  var reduce = function(key, values){
    var result = values[0]
    for (var i = 1; i < values.length; i++) {
      if (values[i].value < result.value) {
        result = values[i];
      }
    }
    return result
  }

  aggInternal(req, res, next, map, reduce, req.query.prop, req.query.groupby)
}

function aggInternal(req, res, next, map, reduce, prop, groupby) {
  req.collection.mapReduce(map, reduce, {query: req.body, scope: {property: prop, group: groupby}, out: {replace : 'replaceThisCollection'}}, function(e, outCollection) {
    if (e) {
      console.log(e)
    }
    outCollection.find().toArray(function(e, results) {
      res.send(results)
      next()
    })
  })
}
