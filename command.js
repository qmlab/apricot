var mongoskin = require('mongoskin')
var db = mongoskin.db('mongodb://@localhost:27017/db', {safe:true})

module.exports.insert = function(req, res, next) {
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
