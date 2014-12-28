var Grid = require('gridfs-stream')
, mongo = require('mongodb')

var gridStore = mongo.GridStore

//var fs = require('fs')

module.exports.writeFile = function(req, res, next) {
  var gfs = Grid(req.db, mongo)
  gfs.remove({
    filename: req.params.fileName,
    root: req.collection.collectionName
  }, function (e) {
    if (e) {
      res.send({ msg: 'error' })
      throw e
    }
    else {
      req.pipe(gfs.createWriteStream({
        filename: req.params.fileName,
        root: req.collection.collectionName
      }))

      res.writeHead(200);

      var fileSize = req.headers['content-length'];
      var uploadedBytes = 0 ;
      req.on('data',function(d){
        uploadedBytes += d.length;
        var p = (uploadedBytes/fileSize) * 100;
        res.write("Uploading " + parseInt(p)+ " %\n");
      });

      req.on('end',function(){
        res.end("File Upload Complete");
      });
      next()
    }
  })
}


module.exports.readFile = function(req, res, next) {
  var gfs = Grid(req.db, mongo)
  var readstream = gfs.createReadStream({
    filename: req.params.fileName,
    root: req.collection.collectionName
  })

  //error handling, e.g. file does not exist
  readstream.on('error', function (e) {
    res.send('An error occurred!', e)
    throw e
  })

  readstream.pipe(res)
}

module.exports.listFiles = function(req, res, next) {
  var gfs = Grid(req.db, mongo)
  gfs.collection(req.collection.collectionName).find().toArray(function (e, files) {
    if (e) {
      res.send(e)
    }
    else {
      res.send(files)
    }
    next()
  })
}

module.exports.deleteFile = function(req, res, next) {
  var gfs = Grid(req.db, mongo)
  gfs.remove({
    filename: req.params.fileName,
    root: req.collection.collectionName
  }, function (e) {
    if (e) {
      res.send({ msg: 'error' })
      throw e
    }
    else {
      res.send({ msg: 'success' })
    }
  })
}
