var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const catalogRouter = require("./routes/catalog"); //Import routes for "catalog" area of site

const compression = require("compression");
const helmet = require("helmet");

// Set up rate limiter: maximum of twenty requests per minute
var RateLimit = require("express-rate-limit");
var limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});

var app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);

const dev_db_url = "mongodb://root:example@localhost";
const mongoDB = process.env.MONGODB_URI || dev_db_url;

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// add the middleware libraries
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// add the non-static routes that the site will provide
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/catalog", catalogRouter); // Add catalog routes to middleware chain.
app.use(compression()); // Compress all routes
app.use(helmet()); // secure http headers

// Apply rate limiter to all requests
app.use(limiter);

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

module.exports = app;
