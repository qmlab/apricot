// Load required packages
var User = require('../models/user');

exports.postUsers = function(req, res, next) {
  var user = new User({
    username: req.body.username,
    password: req.body.password
  })

  user.save(function(e) {
    if (e) {
      res.send(e)
    }
    else {
      res.send({
        user: user.username,
        adminKey: user.adminKey,
        apiKey: user.apiKey
      });
    }
    next()
  })
}

exports.getUsers = function(req, res, next) {
  User.find(function(e, users) {
    if (e) {
      res.send(e)
    }
    else {
      res.send(users.map(function(user) {
        return user.username
      }))
    }
    next()
  })
}

exports.deleteUsers = function(req, res, next) {
  User.remove(req.body, function(e) {
    if (e) {
      res.send(e)
    }
    else {
      res.send({ msg: 'success' })
    }
    next()
  })
}

exports.getUser = function(key, callback) {
  User.findOne({ $or: [ { adminKey: key }, { apiKey: key } ] }, callback)
}
