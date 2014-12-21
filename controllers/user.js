// Load required packages
var User = require('../models/user');

// Create endpoint /users for POST
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
      res.send({ message: 'New user added' });
    }
    next()
  })
}

// Create endpoint /users for GET
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
