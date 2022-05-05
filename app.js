const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('hbs');
const fileUpload=require('express-fileupload')
const bodyParser = require('body-parser')
const session = require('express-session')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var con=require('./config/config');

app.set('views', path.join( __dirname, 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(__dirname + "/views/partials");

app.all("/*",function(req,res,next){
  req.app.locals.layout = "layout/admin-layout";
  next();
})
app.all("/users*",function(req,res,next){
  req.app.locals.layout = "layout/userLayout";
  next();
})


app.use(session({secret:'keyboardcat', cookie:{ maxAge: 6000000 }}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(fileUpload());


app.use('/', indexRouter);
app.use('/users', usersRouter);

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
























































































































