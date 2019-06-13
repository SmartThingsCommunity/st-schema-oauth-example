"use strict";
require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const session = require("express-session");
const DynamoDBStore = require('dynamodb-store');
const path = require('path');
const morgan = require('morgan');
//const EventEmitter = require('events');
//const Stream = new EventEmitter();

const indexRouter = require('./routes/index');
const devicesRouter = require('./routes/devices');
const oauthRouter = require('./routes/oauth');
const schemaRouter = require('./routes/schema');

const port = process.env.PORT || 3000
const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan(":method :url :status Authorization: :req[authorization] Debug info: :res[x-debug] Redirect: :res[location]"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  store: new DynamoDBStore({"table": {"name": "sts_oauth_example_sessions"}}),
  secret: "oauth example secret",
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}));

app.use('/', indexRouter);
app.use('/devices', devicesRouter);
app.use('/oauth', oauthRouter);
app.use('/schema', schemaRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

console.log(`Home:           ${process.env.SERVER_URL}`);
console.log(`Login:          ${process.env.SERVER_URL}/login`);
console.log(`Devices:        ${process.env.SERVER_URL}/devices`);
console.log(`OAuth Test:     ${process.env.SERVER_URL}/oauth/login?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.SERVER_URL}/redirect&state=xxxyyyzzz`);
console.log(`Authorization:  ${process.env.SERVER_URL}/oauth/login`);
console.log(`Refresh:        ${process.env.SERVER_URL}/oauth/token`);
console.log(`ST Schema:      ${process.env.SERVER_URL}/schema`);
console.log(`Client ID:      ${process.env.CLIENT_ID}`);
console.log(`Client Secret:  ${process.env.CLIENT_SECRET}`);

app.listen(port);
