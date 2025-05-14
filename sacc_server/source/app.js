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

const allowedOrigins = [
  'http://sacb.co.in',
  'https://sacb.co.in',
  'http://www.sacb.co.in',
  'https://www.sacb.co.in',
  // Add other environments as needed
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  exposedHeaders: ['set-cookie']
}));
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
// app.use(session({
//   resave: false,
//   saveUninitialized: true,
//   secret: 'i6lolr556x7'
// }));
// app.use(passport.initialize());
// app.use(passport.session());


// DB initialization
require('./commons/models/initialize');

app.use((req, res, next) => {
  console.log(`Incoming: ${req.method} ${req.url}`);
  next();
});

// Gateway controls and routes
app.use('/api', RouteManager);

// Catch 404 and forward to error handler
// Remove any existing 404 handler and replace with:
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ 
      error: 'Endpoint not found',
      path: req.originalUrl 
    });
  }
  res.status(404).send('Page not found');
});

// Error handler
app.use(errorHandeler);

module.exports = app;

