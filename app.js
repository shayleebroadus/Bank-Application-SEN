var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var indexRouter = require('./routes/index');
var registerRouter = require('./routes/register');
var loginuserRouter = require('./routes/loginuser');
var customerInfoRouter = require('./routes/customerInfo');
var employeehomeRouter = require('./routes/employeehome');
var customerhomeRouter = require('./routes/customerhome');
var updateInfoRouter = require('./routes/updateinfo');
var changepasswordRouter =require('./routes/changePassword');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap-icons/")));

app.use(express.static(path.join(__dirname, "node_modules/crypto-js/")));

//set up database connection if it doesnt exist
console.log("accessing dbCon");
var dbCon = require('./lib/database');
var dbSession=require('./lib/sessionPool.js');
var sessionStore= new MySQLStore({}, dbSession);

// Necessary middleware to store session cookies in MySQL
app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret1234',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
cookie : {
  sameSite: 'strict'
}
}));

// Middleware to make session variables available in .ejs template files
app.use(function(req, res, next) {
res.locals.session = req.session;
next();
});

app.use('/', indexRouter);
app.use('/register', registerRouter);
app.use('/loginuser', loginuserRouter);
app.use('/customerinfo', customerInfoRouter);
app.use('/employeehome', employeehomeRouter);
app.use('/customerhome', customerhomeRouter);
app.use('/updateinfo', updateInfoRouter);
app.use('/changepassword', changepasswordRouter );

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
