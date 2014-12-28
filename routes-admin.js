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
  else {    console.error('unrecognized auth')  }  var router = express.Router()  var handler = new rate.Memory.MemoryRateHandler()  var manualLimit = rate.middleware({handler: handler, interval: 1, limit: nconf.get('ratelimits:manual'), setHeaders: true})  // Create endpoint handlers for /users  router.route('/users')  .post(manualLimit, adminAuth, userController.postUser)  .put(manualLimit, adminAuth, userController.postUser)  .get(manualLimit, adminAuth, userController.getUsers)  .delete(manualLimit, adminAuth, userController.deleteUsers)  // Create endpoint handlers for /admin  router.route('/admins')  .post(manualLimit, userController.postAdmin)  .put(manualLimit, adminAuth, userController.postAdmin)  .get(manualLimit, adminAuth, userController.getAdmins)  .delete(manualLimit, adminAuth, userController.deleteUsers)  return router}