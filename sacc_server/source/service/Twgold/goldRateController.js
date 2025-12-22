const mongoose = require('mongoose');
const DailyGoldRate = require('../../commons/models/mongo/documents/TWGoldRates');

function Controller() {}

const normalizeDate = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};


/* CURRENT RATES */
Controller.prototype.getCurrentRates = async (req, res) => {
  const today = normalizeDate();

  const data = await DailyGoldRate.findOne({ date: today }).select('rates');

  res.json({
    success: true,
    data: data?.rates || {}
  });
};



/* DAILY UPDATE (ADMIN) */

Controller.prototype.updateDailyRates = async (req, res) => {
  try {
    const { rates, remarks, effectiveFrom } = req.body;

    if (!rates?.['24k'] || !rates?.['22k']) {
      return res.status(400).json({ success: false, error: 'Invalid rates payload' });
    }

    const date = normalizeDate(effectiveFrom);

    const normalizedRates = {
      '24K': rates['24k'],
      '22K': rates['22k'],
      '20K': rates['20k'],
      '18K': rates['18k'],
      'other': rates['other']
    };

    const record = await DailyGoldRate.findOneAndUpdate(
      { date },
      {
        date,
        rates: normalizedRates,
        updatedBy: req.user.id,
        remarks
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Daily gold rates saved',
      data: record
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* HISTORY + % CHANGE */
Controller.prototype.getRateHistory = async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const records = await DailyGoldRate.find()
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const formatted = records.map((cur, i) => {
    const prev = records[i + 1];

    const todayRate = cur.rates['24K'];
    const prevRate = prev?.rates['24K'] || todayRate;

    return {
      date: cur.date,
      rates: cur.rates,
      changePercent: (((todayRate - prevRate) / prevRate) * 100).toFixed(2)
    };
  });

  res.json({
    success: true,
    page,
    limit,
    data: formatted
  });
};



module.exports = new Controller();
