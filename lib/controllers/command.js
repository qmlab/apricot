module.exports.insertDocs = function(req, res, next) {
  req.collection.insert(req.body, {}, function(e, results){
    if (e) {
      res.send("Failed to insert docs", e)
    }
    else {
      res.send(results)
    }
    req.db.close()
    next()
  })
}

module.exports.insertPlaces = function(req, res, next) {
  req.collection.ensureIndex( {loc: '2dsphere'}, {}, function(e) {
    if (e) {
      res.send("Failed to insert locations", e)
    }
    else {
      req.collection.insert(req.body, {}, function(e, results){
        if (e) {
          res.send("Failed to insert locations", e)
        }
        else {
          res.send(results)
        }
        next()
      })
    }
    req.db.close()
  })
}

module.exports.insertById = function(req, res, next) {
  var obj = req.body
  obj._id = req.params.id
  req.collection.insert(obj, {forceServerObjectId: true}, function(e, results){
    if (e) {
      res.send("Failed to insert doc", e)
    }
    else {
      res.send(results)
    }
    req.db.close()
    next()
  })
}

module.exports.updateById = function(req, res, next) {
  req.collection.updateById(req.params.id, {$set:req.body}, {safe:true, multi:false}, function(e, result){
    if (e) {
      res.send("Failed to update doc", e)
    }
    else {
      res.send((result===1)?{msg:'success'}:{msg:'error'})
    }
    req.db.close()
    next()
  })
}

module.exports.deleteById = function(req, res, next) {
  req.collection.removeById(req.params.id, function(e, result){
    if (e) {
      res.send("Failed to delete doc", e)
    }
    else {
      res.send((result===1)?{msg:'success'}:{msg:'error'})
    }
    req.db.close()
    next()
  })
}

module.exports.createCollection = function(req, res, next) {
  req.db.createCollection(req.params.colName, function(e, result) {
    if (!e) {
      res.send({msg:'success'})
    }
    else {
      res.send({msg:'error'})
    }
    req.db.close()
    next()
  })
}

module.exports.deleteCollection = function(req, res, next) {
  req.db.dropCollection(req.params.colName, function(e, result) {
    if (e) {
      res.send("Failed to delete collection", e)
    }
    else {
      res.send((result===true)?{msg:'success'}:{msg:'error'})
    }
    req.db.close()
    next()
  })
}

module.exports.renameCollection = function(req, res, next) {
  req.db.renameCollection(req.params.colName, req.body.name, function(e, result) {
    if (!e) {
      res.send({msg:'success'})
    }
    else {
      res.send({msg:'error'})
    }
    req.db.close()
    next()
  })
}

module.exports.patchDocs = function(req, res, next) {
  req.collection.update(req.body[0], {$set:req.body[1]}, {safe:true, multi:true}, function(e, result){
    if (e) {
      res.send("Failed to patch docs", e)
    }
    else {
      res.send((result===1)?{msg:'success'}:{msg:'error'})
    }
    req.db.close()
    next()
  })
}

module.exports.patchPlaces = function(req, res, next) {
  req.collection.update({$and:[req.body[0], {"loc": {"$exists": true}}]}, {$set:req.body[1]}, {safe:true, multi:true}, function(e, result){
    if (e) {
      res.send("Failed to patch docs", e)
    }
    else {
      res.send((result===1)?{msg:'success'}:{msg:'error'})
    }
    req.db.close()
    next()
  })
}

module.exports.deleteDocs = function(req, res, next) {
  req.collection.remove(req.body, function(e, result){
    if (e) {
      res.send("Failed to delete docs", e)
    }
    else {
      res.send((!e)?{msg:'success'}:{msg:'error'})
    }
    req.db.close()
    next()
  })
}

module.exports.deletePlaces = function(req, res, next) {
  req.collection.remove({$and:[req.body, {"loc": {"$exists": true}}]}, function(e, result){
    if (e) {
      res.send("Failed to delete docs", e)
    }
    else {
      res.send((!e)?{msg:'success'}:{msg:'error'})
    }
    req.db.close()
    next()
  })
}
