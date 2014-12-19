var express = require('express')
, bodyParser = require('body-parser')
, session = require('express-session')
, compress = require('compression')
, router = require('./routes.js')

var app = express()
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(session({
  secret: 'fruit lover',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 }
}))
app.use(compress())

var mongoskin = require('mongoskin')
var db = mongoskin.db('mongodb://@localhost:27017/db', {safe:true})app.use('/', router(db))// the first parameter is portapp.listen(process.argv[2])