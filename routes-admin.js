var query = require('./controllers/query.js')
, command = require('./controllers/command.js')
, userController = require('./controllers/user.js')
, authController = require('./controllers/auth.js')
, passport = require('passport')
, mongoskin = require('mongoskin')

module.exports = function() {
  var requireAuth = passport.authenticate(nconf.get('server:auth'), { session : false })
  var router = express.Router()  // Create endpoint handlers for /users  router.route('/users')  .post(userController.postUsers)  .get(requireAuth, userController.getUsers)  return router}