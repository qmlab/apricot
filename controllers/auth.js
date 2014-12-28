// Load required packages
var passport = require('passport')
, basicStrategy = require('passport-http').BasicStrategy
, digestStrategy = require('passport-http').DigestStrategy
, User = require('../models/user')

passport.use('basic-admin', new basicStrategy(
  function(username, password, done) {
    User.findOne({ adminKey: username }, function (err, user) {
      if (err) { return done(err) }

      // No user found with that username
      if (!user) { return done(null, false) }

      // Make sure the password is correct
      user.verifyPassword(password, function(err, isMatch) {
        if (err) { return done(err) }

        // Password did not match
        if (!isMatch) { return done(null, false) }

        // Success
        return done(null, user)
      })
    })
  }
))

passport.use('basic-user', new basicStrategy(
  function(username, password, done) {
    User.findOne({ apiKey: username }, function (err, user) {
      if (err) { return done(err) }

      // No user found with that username
      if (!user) { return done(null, false) }

      // Make sure the password is correct
      user.verifyPassword(password, function(err, isMatch) {
        if (err) { return done(err) }

        // Password did not match
        if (!isMatch) { return done(null, false) }

        // Success
        return done(null, user)
      })
    })
  }
))

passport.use('digest-admin', new digestStrategy({ qop: 'auth' },
  function(username, done) {
    User.findOne({ adminKey: username }, function(err, user) {
      if (err) { return done(err) }
      if (!user) { return done(null, false)}
      return done(null, user, user.password)
    })
  },
  function (params, done) {
    done(null, true)
  }
))

passport.use('digest-user', new digestStrategy({ qop: 'auth' },
  function(username, done) {
    User.findOne({ apiKey: username }, function(err, user) {
      if (err) { return done(err) }
      if (!user) { return done(null, false)}
      return done(null, user, user.password)
    })
  },
  function (params, done) {
    done(null, true)
  }
))
