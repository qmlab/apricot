var express = require('express')
, bodyParser = require('body-parser')
, session = require('express-session')
, compress = require('compression')
, util = require('./util.js')
, router = require('./routes.js')

var nconf = require('nconf');

// First consider commandline arguments and environment variables, respectively.
nconf.argv().env();

// Provide values for production
nconf.file({ file: 'config.json' });

// Provide default values for debugging
nconf.defaults({
  'server': {
    'secret': 'fruit lover'
    , 'resave': false
    , 'saveUninitialized': true
    , 'cookielife': 60000
    , 'compress': false
    , 'port': 10086
  },
  'db': {
    'mongourl': 'mongodb://@localhost:27017/db'
  }
});

var app = express()
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(session({
  secret: nconf.get('server:secret'),
  resave: nconf.get('server:resave'),
  saveUninitialized: nconf.get('server:saveUninitialized'),
  cookie: { maxAge: nconf.get('server:cookielife')}
}))

if (nconf.get('server:compress')) {
  app.use(compress())
}

var mongoskin = require('mongoskin')
var db = mongoskin.db(nconf.get('db:mongourl'), {safe:true})var baseurl = nconf.get('server:baseurl')var version = nconf.get('app:version')app.use(baseurl ? baseurl : '/', router(db))if (version) {  // Versioned URLs  app.use(util.trimTailingSlash(baseurl ? baseurl : '/') + '/' + version, router(db))  // Old versions  //app.use(util.trimTailingSlash(baseurl ? baseurl : '/') + '/v0.5', routerV05(db))  //app.use(util.trimTailingSlash(baseurl ? baseurl : '/') + '/v0.3', routerV03(db))  //...}// the first parameter is portapp.listen(nconf.get('server:port'))