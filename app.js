/* Entry file for the app */
express = require('express')
util = require('./util.js')

var bodyParser = require('body-parser')
, session = require('express-session')
, compress = require('compression')
, nconf = require('nconf')
, router = require('./routes.js')
, mongoskin = require('mongoskin')

// Whether this is debug or release
var isDebug = true

// First consider commandline arguments and environment variables, respectively.
nconf.argv().env();

if (!isDebug) {
  // Provide configs for release
  nconf.file({ file: 'release-config.json' });
}
else {
  // Provide configs for release
  nconf.file({ file: 'debug-config.json' });
}


// Init DB (Global)
db = mongoskin.db(nconf.get('db:mongourl'), {safe:true})

// Init body-parser
var app = express()
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

// Init session management
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

// Init URLs with versioning
var baseurl = nconf.get('server:baseurl')
var version = nconf.get('app:version')app.use(baseurl ? baseurl : '/', router())if (version) {  // Versioned URLs  app.use(util.trimTailingSlash(baseurl ? baseurl : '/') + '/' + version, router())  // Old versions  //app.use(util.trimTailingSlash(baseurl ? baseurl : '/') + '/v0.5', routerV05)  //app.use(util.trimTailingSlash(baseurl ? baseurl : '/') + '/v0.3', routerV03)  //...}// Start the serverapp.listen(nconf.get('server:port'))