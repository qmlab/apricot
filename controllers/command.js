module.exports.insertDocs = function(req, res, next) {
  req.collection.insert(req.body, {}, function(e, results){
    res.send(results)
    next()
  })
}

module.exports.updateById = function(req, res, next) {
  req.collection.updateById(req.params.id, {$set:req.body}, {safe:true, multi:false}, function(e, result){
    res.send((result===1)?{msg:'success'}:{msg:'error'})
    next()
  })
}

module.exports.deleteById = function(req, res, next) {
  req.collection.removeById(req.params.id, function(e, result){
    res.send((result===1)?{msg:'success'}:{msg:'error'})
    next()
  })
}

module.exports.createCollection = function(req, res, next) {
  db.createCollection(req.params.colName, function(e, result) {
    if (!e) {
      res.send({msg:'success'})
    }
    else {
      res.send({msg:'error'})
    }
    next()
  })
}

module.exports.deleteCollection = function(req, res, next) {
  db.dropCollection(req.params.colName, function(e, result) {
    res.send((result===true)?{msg:'success'}:{msg:'error'})
    next()
  })
}

module.exports.renameCollection = function(req, res, next) {
  db.renameCollection(req.params.colName, req.body.name, function(e, result) {
    if (!e) {
      res.send({msg:'success'})
    }
    else {
      res.send({msg:'error'})
    }
    res.send((result===true)?{msg:'success'}:{msg:'error'})
    next()
  })
}

module.exports.patchDocs = function(req, res, next) {
  req.collection.update(req.body[0], {$set:req.body[1]}, {safe:true, multi:true}, function(e, result){
    res.send((result===1)?{msg:'success'}:{msg:'error'})
    next()
  })
}

module.exports.deleteDocs = function(req, res, next) {
  req.collection.remove(req.body, function(e, result){
    res.send((!e)?{msg:'success'}:{msg:'error'})
    next()
  })
}
