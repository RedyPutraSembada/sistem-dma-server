var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

//* import cek tanggal
const { cekTgl } = require('./app/middleware/index');
//* import decodeToken
const { decodeToken } = require('./app/middleware/checkAuth');

//* Routes

const userAuthRoute = require('./routes/userAuthRoute');
const productRoute = require('./routes/productRoute');
const barangKeluarRoute = require('./routes/barangKeluarRoute');
const barangMasukRoute = require('./routes/barangMasukRoute');
const userRoute = require('./routes/userRoute');
const indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/images', express.static(path.join(__dirname, 'public/images/products')));
cekTgl();

app.use(decodeToken());
app.use('/', indexRouter);
app.use('/auth', userAuthRoute);
app.use('/api', userRoute);
app.use('/api', productRoute);
app.use('/api', barangKeluarRoute);
app.use('/api', barangMasukRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
