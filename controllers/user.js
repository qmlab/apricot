// Load required packages
var User = require('../models/user');

// Create endpoint /api/users for POST
exports.postUsers = function(req, res, next) {
  var user = new User({
    username: req.body.username,
    password: req.body.password
  })

  user.save(function(err) {
    if (err) console.log(err)
    res.send({ message: 'New user has been successfully added' });
    next()
  })
}

// Create endpoint /api/users for GET
exports.getUsers = function(req, res, next) {
  User.find(function(err, users) {
    if (err) console.log(err)
    res.send(users)
    next()
  })
}
