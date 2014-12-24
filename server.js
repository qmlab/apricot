/* Entry file for the app */
express = require('express')
util = require('./util.js')
nconf = require('nconf')

var bodyParser = require('body-parser')
, session = require('express-session')
, compress = require('compression')
, router = require('./routes-user.js')
, routerAdmin = require('./routes-admin.js')
, passport = require('passport')
, authController = require('./controllers/auth.js')
, mongoose = require('mongoose')
, fs = require('fs')
, http = require('http')
, https = require('https')

// First consider commandline arguments and environment variables, respectively.
nconf.argv().env();

// Whether this is debug or release
var isDebug = false

if (nconf.get('debug')) {
  console.log('debug mode')
  isDebug = true
}

if (!isDebug) {
  // Provide configs for release
  nconf.file({ file: 'release-config.json' });
}
else {
  // Provide configs for release
  nconf.file({ file: 'debug-config.json' });
}


// Init DB (Global)
mongoose.connect(nconf.get('db:mongourl'))

var app = express()

// Init body-parser
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

// Init session management(only for iterations)
app.use(session({
  secret: nconf.get('server:secret'),
  resave: nconf.get('server:resave'),
  saveUninitialized: nconf.get('server:saveUninitialized'),
  cookie: { maxAge: nconf.get('server:cookielife')}
}))

// Init compression management
if (nconf.get('server:compress')) {
  app.use(compress())
}

// Init Auth manager
app.use(passport.initialize())

// Init URLs with versioning
var baseurl = nconf.get('server:baseurl')
var version = nconf.get('app:version')app.use('/manage', routerAdmin())app.use('/db' + (baseurl ? baseurl : ''), router())if (version) {  // Versioned URLs  app.use(util.trimTailingSlash('/db' + (baseurl ? baseurl : '')) + '/' + version, router())  // Older versions  //app.use(util.trimTailingSlash('/db' + (baseurl ? baseurl : '')) + '/v0.5' + version, router())  //app.use(util.trimTailingSlash('/db' + (baseurl ? baseurl : '')) + '/v0.2' + version, router())  //...}// Start servervar protocol = nconf.get('server:protocol')var port = nconf.get('server:port')if (protocol === 'http') {  app.listen(port)}else if (protocol === 'https') {  var privateKey  = fs.readFileSync('certs/serverkey.pem', 'utf8')  var certificate = fs.readFileSync('certs/server.cer', 'utf8')  var credentials = {key: privateKey, cert: certificate}  var httpsServer = https.createServer(credentials, app)  httpsServer.listen(port)}