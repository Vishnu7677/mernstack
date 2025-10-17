// controllers/paymentController.js
const razorpay = require('../../commons/config/razorpay');
const Payment = require('../../commons/models/mongo/documents/Payment');
const crypto = require('crypto');
const Registration = require('../../commons/models/mongo/documents/Registration');

// helpers
const paise = (rupees) => Math.round(Number(rupees) * 100);
function Controller() {}

// Enhanced createOrder in controller
Controller.prototype.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = `rcpt_${Date.now()}`, notes = {} } = req.body;
    
    // Better validation
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid amount is required' 
      });
    }

    // Validate currency
    const allowedCurrencies = ['INR'];
    if (!allowedCurrencies.includes(currency)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Only INR currency is supported' 
      });
    }

    const options = {
      amount: paise(amount),
      currency,
      receipt,
      payment_capture: 1,
      notes
    };

    const order = await razorpay.orders.create(options);
    
    // Log successful order creation
    console.log(`Order created: ${order.id} for amount: ${amount}`);

    return res.json({ 
      success: true, 
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      }
    });
  } catch (err) {
    console.error('createOrder Error:', err);
    
    // More specific error responses
    if (err.error && err.error.description) {
      return res.status(400).json({ 
        success: false, 
        error: err.error.description 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to create payment order' 
    });
  }
};

function pad(n, width=4) {
  return String(n).padStart(width, '0');
}

Controller.prototype.verifyAndSavePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, additionalData } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ error: 'Missing required fields' });

    // verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RZP_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, verified: false, message: 'Invalid signature' });
    }

    // fetch full payment object from Razorpay (optional)
    let paymentObj = null;
    try {
      paymentObj = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (fetchErr) {
      console.warn('Could not fetch payment from Razorpay; saving with available data', fetchErr);
    }

    const payload = paymentObj || {
      id: razorpay_payment_id,
      order_id: razorpay_order_id,
      captured: true,
      status: 'captured',
      ...additionalData
    };

    const doc = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: payload.amount,
      amount_in_rupees: payload.amount ? payload.amount / 100 : undefined,
      currency: payload.currency || 'INR',
      status: payload.status,
      captured: payload.captured,
      method: payload.method,
      description: payload.description,
      email: payload.email,
      contact: payload.contact,
      created_at: payload.created_at,
      raw_payment: payload,
      notes: payload.notes || {}
    };

    const paymentDoc = await Payment.findOneAndUpdate(
      { razorpay_payment_id },
      doc,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // -----------------------
    // Create/Upsert Registration
    // -----------------------
    try {
      // additionalData expected shape:
      // { teamData: { teamName, teamEmail, captainName, captainPhone, ... }, members: [...], registrationReceipt }
      const teamData = (additionalData && additionalData.teamData) || {};
      const members = (additionalData && additionalData.members) || [];
      const receipt = (additionalData && additionalData.registrationReceipt) || teamData.receipt || doc.receipt;

      // Avoid duplicates: if registration for this payment exists, update it
      let reg = await Registration.findOne({ paymentId: razorpay_payment_id });

      if (!reg) {
        // generate registration number using count (simple auto-increment approximation)
        const count = await Registration.countDocuments({});
        const year = new Date().getFullYear();
        const regNumber = `SAC${year}-${pad(count + 1, 4)}`;

        reg = new Registration({
          tournamentName: teamData.tournamentName || 'SAC Premier League 2025',
          registrationNumber: regNumber,
          receipt: receipt || '',
          teamName: teamData.teamName || teamData.name || '',
          teamEmail: teamData.teamEmail || teamData.email || '',
          captainName: teamData.captainName || '',
          captainPhone: teamData.captainPhone || '',
          state: teamData.state || '',
          district: teamData.district || '',
          members: members,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          amountPaid: doc.amount_in_rupees || (doc.amount ? doc.amount / 100 : undefined),
          currency: doc.currency || 'INR',
          status: doc.status || 'captured',
          rawPayment: paymentDoc
        });

        await reg.save();
      } else {
        // update existing registration
        reg.tournamentName = reg.tournamentName || teamData.tournamentName || 'SAC Premier League 2025';
        reg.receipt = receipt || reg.receipt;
        reg.teamName = teamData.teamName || reg.teamName;
        reg.teamEmail = teamData.teamEmail || reg.teamEmail;
        reg.captainName = teamData.captainName || reg.captainName;
        reg.captainPhone = teamData.captainPhone || reg.captainPhone;
        reg.members = members.length ? members : reg.members;
        reg.amountPaid = doc.amount_in_rupees || reg.amountPaid;
        reg.status = doc.status || reg.status;
        reg.rawPayment = paymentDoc;
        await reg.save();
      }
    } catch (regErr) {
      console.error('Failed to save registration', regErr);
      // don't fail the entire response just for registration save
    }

    return res.json({ success: true, verified: true, payment: paymentDoc });
  } catch (err) {
    console.error('verifyAndSavePayment', err);
    return res.status(500).json({ success: false, error: err.message || err });
  }
};

Controller.prototype.fetchPayment = async (req, res) => {
  try {
    const { id } = req.params; // can be razorpay_payment_id or DB id
    if (!id) return res.status(400).json({ error: 'Payment id required' });

    // try DB first
    let payment = await Payment.findOne({ razorpay_payment_id: id });
    if (!payment) payment = await Payment.findById(id);

    // fetch up-to-date from razorpay too
    let rzpPayment = null;
    try { rzpPayment = await razorpay.payments.fetch(id); } catch (e) {/* ignore */ }

    return res.json({ success: true, db: payment, razorpay: rzpPayment });
  } catch (err) {
    console.error('fetchPayment', err);
    return res.status(500).json({ success: false, error: err.message || err });
  }
};

Controller.prototype.listPayments = async (req, res) => {
  try {
    // optional query params: from, to, count, skip
    const { from, to, count = 10, skip = 0 } = req.query;

    // fetch from DB
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Math.min(Number(count), 100));

    return res.json({ success: true, payments });
  } catch (err) {
    console.error('listPayments', err);
    return res.status(500).json({ success: false, error: err.message || err });
  }
};

Controller.prototype.capturePaymentManually = async (req, res) => {
  try {
    // body: { payment_id, amount } amount in rupees OR paise? We'll expect rupees for convenience
    const { payment_id, amount } = req.body;
    if (!payment_id || !amount) return res.status(400).json({ error: 'payment_id and amount required' });

    const captured = await razorpay.payments.capture(payment_id, paise(amount), 'INR'); // will return captured payment
    // update DB
    await Payment.findOneAndUpdate({ razorpay_payment_id: payment_id }, { raw_payment: captured, status: captured.status, captured: captured.captured }, { upsert: true });
    return res.json({ success: true, captured });
  } catch (err) {
    console.error('capturePaymentManually', err);
    return res.status(500).json({ success: false, error: err.message || err });
  }
};

Controller.prototype.initiateRefund = async (req, res) => {
  try {
    // body: { payment_id, amount (optional, rupees), notes (optional) }
    const { payment_id, amount, notes } = req.body;
    if (!payment_id) return res.status(400).json({ error: 'payment_id required' });

    const options = {};
    if (amount) options.amount = paise(amount); // paise
    if (notes) options.notes = notes;

    const refund = await razorpay.payments.refund(payment_id, options); // returns refund object
    // push refund into DB record
    await Payment.findOneAndUpdate(
      { razorpay_payment_id: payment_id },
      { $push: { refunds: { id: refund.id, status: refund.status, amount: refund.amount, currency: refund.currency, created_at: refund.created_at, raw: refund } } },
      { upsert: true }
    );

    return res.json({ success: true, refund });
  } catch (err) {
    console.error('initiateRefund', err);
    // Razorpay returns structured error -> forward it
    const message = err.error || err.message || err;
    return res.status(500).json({ success: false, error: message });
  }
};

Controller.prototype.fetchRefundsForPayment = async (req, res) => {
  try {
    const { payment_id } = req.params;
    if (!payment_id) return res.status(400).json({ error: 'payment_id required' });

    // fetch from Razorpay: GET /payments/:id/refunds
    const refunds = await razorpay.payments.refunds(payment_id);
    return res.json({ success: true, refunds });
  } catch (err) {
    console.error('fetchRefundsForPayment', err);
    return res.status(500).json({ success: false, error: err.error || err.message || err });
  }
};


module.exports = new Controller();
