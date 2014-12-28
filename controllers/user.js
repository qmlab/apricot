// Load required packages
var bcrypt = require('bcrypt-nodejs')
, User = require('../models/user')

exports.postUser = function(req, res, next) {
  User.findOne( { username: req.body.username }, function(e, user) {
    if (e) {
      res.send('Failed to add/update user', e)
    }
    if (!user) {
      user = new User({
        username: req.body.username,
        password: req.body.password
      })
    }
    else {
      user.password = req.body.password
    }

    // Password changed so we need to hash it
    bcrypt.genSalt(5, function(err, salt) {
      if (err) return callback(err);
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) return callback(err);
        user.password = hash;
        bcrypt.hash(user.username + '+' + 'monkey', salt, null, function(err, hash) {
          if (err) return callback(err);
          user.apiKey = hash;
          user.save(function(e) {
            if (e) {
              res.send(e)
            }
            else {
              res.send({
                user: user.username,
                apiKey: user.apiKey
              });
            }
            next()
          })
        })
      })
    })
  })
}

exports.postAdmin = function(req, res, next) {
  User.findOne( { username: req.body.username }, function(e, user) {
    if (e) {
      res.send('Failed to add/update admin', e)
    }
    if (!user) {
      user = new User({
        username: req.body.username,
        password: req.body.password
      })
    }
    else {
      user.password = req.body.password
    }

    // Password changed so we need to hash it
    bcrypt.genSalt(5, function(err, salt) {
      if (err) return callback(err);
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) return callback(err);
        user.password = hash;
        bcrypt.hash(user.username + '+' + 'panda', salt, null, function(err, hash) {
          if (err) return callback(err);
          user.adminKey = hash;
          bcrypt.hash(user.username + '+' + 'tiger', salt, null, function(err, hash) {
            if (err) return callback(err);
            user.apiKey = hash;
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
          })
        })
      })
    })
  })
}

exports.getUsers = function(req, res, next) {
  User.find({ adminKey: { $exists: false } }, function(e, users) {
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

exports.getAdmins = function(req, res, next) {
  User.find({ adminKey: { $exists: true } }, function(e, users) {
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
