var express = require('express')
, bodyParser = require('body-parser')
, session = require('express-session')
, compress = require('compression')
, util = require('./util.js')
, router = require('./routes.js')
, nconf = require('nconf')

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


// Init DB
var mongoskin = require('mongoskin')
var db = mongoskin.db(nconf.get('db:mongourl'), {safe:true})

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
var version = nconf.get('app:version')app.use(baseurl ? baseurl : '/', router(db))if (version) {  // Versioned URLs  app.use(util.trimTailingSlash(baseurl ? baseurl : '/') + '/' + version, router(db))  // Old versions  //app.use(util.trimTailingSlash(baseurl ? baseurl : '/') + '/v0.5', routerV05(db))  //app.use(util.trimTailingSlash(baseurl ? baseurl : '/') + '/v0.3', routerV03(db))  //...}// Start the serverapp.listen(nconf.get('server:port'))