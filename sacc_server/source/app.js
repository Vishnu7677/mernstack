require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const fs = require('fs');
const path = require('path');
const appLog = require('morgan');
const bodyParser = require('body-parser');
const swaggerUI = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');


// Import routes and middleware
const RouteManager = require('./routes/routeManager');
const Payment = require('./commons/models/mongo/documents/Payment');

const app = express();

// 🔹 Simple env flag
const isProd = process.env.NODE_ENV === 'production';

// 🔹 If you're behind a reverse proxy (Nginx, Cloudflare, etc.)
app.set('trust proxy', 1);

/* ------------------- SECURITY MIDDLEWARE ------------------- */
app.use(helmet());

// Rate limiting - exclude webhook from rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  skip: (req) => {
    // Skip rate limiting for Razorpay webhook and health check
    return req.originalUrl === '/api/payment/webhook' || req.originalUrl === '/health';
  }
});
app.use('/api/', limiter);


/* ------------------- CORS CONFIG ------------------- */
const allowedOrigins = [
  "https://www.sacb.co.in",
  "https://sacb.co.in",
  "http://localhost:3000",
  "http://localhost:5000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked for:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With", 
    "Accept", 
    "Origin",
    "X-CSRF-Token"
  ],
  exposedHeaders: ["Set-Cookie", "Authorization"],
  maxAge: 86400 // 24 hours
}));

// ✅ Allow Preflight (OPTIONS) request
app.options('*', cors());

/* ------------------- RAZORPAY WEBHOOK (RAW BODY) ------------------- */
// This MUST be before express.json() and other body parsers
app.post('/api/payment/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const crypto = require('crypto');

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(req.body);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      console.warn('Invalid webhook signature');
      return res.status(400).json({ ok: false, message: 'Invalid signature' });
    }

    const payload = JSON.parse(req.body.toString());
    const ev = payload.event;
    const data = payload.payload || {};

    // handle payment events
    if (['payment.captured', 'payment.authorized', 'payment.failed', 'payment.refunded'].includes(ev)) {
      const payment = data.payment?.entity;
      if (payment?.id) {
        await Payment.findOneAndUpdate(
          { razorpay_payment_id: payment.id },
          {
            razorpay_order_id: payment.order_id,
            razorpay_payment_id: payment.id,
            amount: payment.amount,
            amount_in_rupees: payment.amount / 100,
            currency: payment.currency,
            status: payment.status,
            captured: payment.captured,
            method: payment.method,
            raw_payment: payment,
            notes: payment.notes || {},
          },
          { upsert: true }
        );
      }
    }

    // handle refund events
    if (ev?.startsWith('refund.')) {
      const refund = data.refund?.entity;
      if (refund?.payment_id) {
        await Payment.findOneAndUpdate(
          { razorpay_payment_id: refund.payment_id },
          {
            $push: {
              refunds: {
                id: refund.id,
                status: refund.status,
                amount: refund.amount,
                currency: refund.currency,
                created_at: refund.created_at,
                raw: refund,
              },
            },
          }
        );
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/* ------------------- BODY PARSERS ------------------- */
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

/* ------------------- DATA SANITIZATION ------------------- */
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent parameter pollution


/* ------------------- API DOCS ------------------- */
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

/* ------------------- LOGGING ------------------- */
app.set("view engine", "jade");

// Ensure logs directory exists (avoids crash in prod)
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const apiLogFile = process.env.FILE_API_LOG || 'api.log';

app.use(
  appLog('common', {
    stream: fs.createWriteStream(path.join(logDir, apiLogFile), { flags: 'a' }),
  })
);

// Only use verbose 'dev' logger in non-production
if (!isProd) {
  app.use(appLog('dev'));
}


/* ------------------- STATIC FILES ------------------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ------------------- DATABASE INIT ------------------- */
require('./commons/models/initialize');

/* ------------------- DEBUG MIDDLEWARE ------------------- */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/* ------------------- MAIN ROUTES ------------------- */
app.use('/', RouteManager);

/* ------------------- HEALTH CHECK ------------------- */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

/* ------------------- 404 HANDLER ------------------- */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
});

/* ------------------- GLOBAL ERROR HANDLER ------------------- */
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages,
      code: 'VALIDATION_ERROR'
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      code: 'DUPLICATE_ENTRY'
    });
  }

  // Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID',
      code: 'INVALID_ID'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export the Express app only (no server startup)
module.exports = app;
