module.exports.usage = function(req, res, next) {
  res.send(util.usage())
  next()
}

module.exports.findById = function(req, res, next) {
  req.collection.findById(req.params.id, function(e, result){
    res.send(result)
    next()
  })
}

module.exports.getCollections = function(req, res, next) {
  req.db.collectionNames(function(err, items) {
    res.send(util.pageResult(items, req.query.page, req.query.per_page))
    next()
  })
}

module.exports.getDocs = function(req, res, next) {
  var start = util.getStart(req.query.page, req.query.per_page)
  var max =  parseInt(req.query.per_page)
  var sort = (req.query.orderby) ? req.query.orderby : '_id'
  var order = (req.query.desc) ? -1 : 1
  var options = {
    skip: start,
    limit: max,
    sort: [[sort, order]]
  }

  req.collection.find(req.body, options).toArray(function(e, results){
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
  if (!sess.previousQuery ||
    JSON.stringify(sess.previousQuery) != JSON.stringify(req.body)) {
    sess.previousQuery = req.body
    sess.skipToken = 0
  }

  var sort = (req.query.orderby) ? req.query.orderby : '_id'
  var order = (req.query.desc) ? -1 : 1
  var options = {
    skip: sess.skipToken,
    limit: size,
    sort: [[sort, order]]
  }

  req.collection.find(req.body, options).toArray(function(e, results) {
    res.send(results)
    next()
  })

  sess.skipToken += size
}

module.exports.reset = function(req, res, next) {
  var sess = req.session
  sess.skipToken = 0
  res.send((sess.skipToken === 0)?{msg:'success'}:{msg:'error'})
  next()
}

module.exports.count = function(req, res, next) {
  var map = function() {
    emit(this[group], 1)
  }

  var reduce = function(key, values){
    return Array.sum(values)
  }

  util.aggInternal(req, res, next, map, reduce, req.query.prop, req.query.groupby)
}

module.exports.sum = function(req, res, next) {
  var map = function() {
    emit(this[group], this[property])
  }

  var reduce = function(key, values) {
    return Array.sum(values)
  }

  util.aggInternal(req, res, next, map, reduce, req.query.prop, req.query.groupby)
}

module.exports.avg = function(req, res, next) {
  var map = function() {
    emit(this[group], this[property])
  }

  var reduce = function(key, values) {
    return values.length != 0 ? Array.sum(values) / values.length : 0
  }

  util.aggInternal(req, res, next, map, reduce, req.query.prop, req.query.groupby)
}

module.exports.max = function(req, res, next) {
  var map = function(){
    var content = {value: this[property], _id: this._id}
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

  util.aggInternal(req, res, next, map, reduce, req.query.prop, req.query.groupby)
}

module.exports.min = function(req, res, next) {
  var map = function(){
    var content = {value: this[property], _id: this._id}
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

  util.aggInternal(req, res, next, map, reduce, req.query.prop, req.query.groupby)
}
