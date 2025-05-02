require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const appLog = require('morgan');
const cors = require('cors');
const passport = require('./commons/auth/Passport');
const RouteManager = require('./routes/routeManager');
const errorHandeler = require('./middleware/error');
const swaggerUI = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');

const app = express();

// Cross-origin
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API docs
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.set("view engine", "jade");
app.use(appLog('common', {
  stream: fs.createWriteStream(`./logs/${process.env.FILE_API_LOG}`, { flags: 'a' })
}));
app.use(appLog('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'i6lolr556x7'
}));
app.use(passport.initialize());
app.use(passport.session());


// DB initialization
require('./commons/models/initialize');

// Gateway controls and routes
app.use('/', RouteManager);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  res.locals.message = 'Welcome to SACC Bank';
  res.locals.error = {
    status: 'Root Route',
    stack: 'You have called for root API or the API that you want does not exist',
  };
  res.render('error');
});

// Error handler
app.use(errorHandeler);

module.exports = app;
