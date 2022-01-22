const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { create } = require('express-handlebars');

const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const carsManagementRouter = require('./routes/cars-management')
const bannerManagementRouter = require('./routes/banner-management')
const bookingsRouter = require('./routes/bookings')
const locationManagementRouter = require('./routes/location-management')
const userManagementRouter = require('./routes/user-management')
const couponManagementRouter = require('./routes/coupon-management')
const reportManagement = require('./routes/report')

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({
  limit: "50mb"
}));
app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: false,
  parameterLimit: 50000
}))
//database connection
var db = require('./config/connection')
const session = require("express-session")
const MongoStore = require('connect-mongo');
require('dotenv')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const hbs = create({
  layoutsDir: `${__dirname}/views/layouts`,
  extname: `hbs`,
  defaultLayout: 'layout',
  partialsDir: `${__dirname}/views/partials`
});
app.engine('hbs', hbs.engine);

hbs.handlebars.registerHelper("inc", (value, options) => {
  return parseInt(value) + 1;
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(fileUpload())

//session
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000
  },
  store: MongoStore.create({
    mongoUrl: 'mongodb://13.232.32.220/turo',
  })
}))

//connect to database
db.connect((err) => {

  if (err) console.log("connection error" + err);
  else console.log("database connected succesfully");
})

//cache control bowser
app.use(function (req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

app.use('/', usersRouter);
app.use('/admin', adminRouter);
app.use('/cars-management', carsManagementRouter)
app.use('/banner-management', bannerManagementRouter)
app.use('/bookings', bookingsRouter)
app.use('/location-management', locationManagementRouter)
app.use('/user-management', userManagementRouter)
app.use('/coupon-management', couponManagementRouter)
app.use('/report', reportManagement)


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
