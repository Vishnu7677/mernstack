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
const bodyParser = require('body-parser');


const Payment = require('./commons/models/mongo/documents/Payment');

const app = express();

/* ------------------- CORS CONFIG ------------------- */
const allowedOrigins = [
  'https://sacb.co.in',
  'https://www.sacb.co.in',
];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error('CORS error: Origin not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  exposedHeaders: ['set-cookie']
}));

/* ------------------- RAZORPAY WEBHOOK (RAW BODY) ------------------- */
// This MUST be before express.json()
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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ------------------- API DOCS ------------------- */
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

/* ------------------- LOGGING ------------------- */
app.set("view engine", "jade");
app.use(appLog('common', {
  stream: fs.createWriteStream(`./logs/${process.env.FILE_API_LOG}`, { flags: 'a' })
}));
app.use(appLog('dev'));

/* ------------------- STATIC FILES ------------------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ------------------- DATABASE INIT ------------------- */
require('./commons/models/initialize');

/* ------------------- DEBUG ------------------- */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});


/* ------------------- MAIN ROUTES ------------------- */
app.use('/', RouteManager);

/* ------------------- HEALTH CHECK ------------------- */
app.get('/health', (req, res) => res.json({ status: 'OK' }));

/* ------------------- ERROR HANDLER ------------------- */
app.use(errorHandeler);

module.exports = app;
