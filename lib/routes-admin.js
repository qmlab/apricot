var query = require('./controllers/query.js')
, command = require('./controllers/command.js')
, userController = require('./controllers/user.js')
, authController = require('./controllers/auth.js')
, passport = require('passport')
, rate = require('express-rate')

module.exports = function() {
  var adminAuth
  if (nconf.get('server:auth') === 'digest') {
    adminAuth = passport.authenticate('digest-admin', { session : false })
  }
  else if (nconf.get('server:auth') === 'basic') {
    adminAuth = passport.authenticate('basic-admin', { session : false })
  }
  else {