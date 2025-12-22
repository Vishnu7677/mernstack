const mongoose = require('mongoose');
const GoldRate = require('../../commons/models/mongo/documents/TWGoldRates');

function Controller() {}

/* CURRENT RATES */
Controller.prototype.getCurrentRates = async (req, res) => {
  try {
    const rates = await GoldRate.find({
      isActive: true
    }).select('type rate');

    const response = {};
    rates.forEach(r => {
      response[r.type] = r.rate;
    });

    res.json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


/* DAILY UPDATE (ADMIN) */
Controller.prototype.updateDailyRates = async (req, res) => {
  const { rates, effectiveFrom, remarks } = req.body;
  const effectiveDate = effectiveFrom ? new Date(effectiveFrom) : new Date();

  // Validation (same as above)
  if (!rates || typeof rates !== 'object') {
    return res.status(400).json({ 
      success: false, 
      error: 'Rates object is required' 
    });
  }

  try {
    const bulkOps = [];
    const updatedRates = [];

    for (const [type, rate] of Object.entries(rates)) {
      // Add operation to deactivate old rates
      bulkOps.push({
        updateMany: {
          filter: { 
            branch: req.user.branch, 
            type, 
            isActive: true 
          },
          update: { 
            isActive: false, 
            effectiveTo: effectiveDate 
          }
        }
      });

      // Add operation to insert new rate
      const newRate = {
        branch: req.user.branch,
        type,
        rate,
        effectiveFrom: effectiveDate,
        updatedBy: req.user.id,
        remarks: remarks || '',
        isActive: true
      };

      bulkOps.push({
        insertOne: {
          document: newRate
        }
      });

      updatedRates.push(newRate);
    }

    // Execute all operations
    await GoldRate.bulkWrite(bulkOps);

    // Format response
    const formattedRates = {};
    updatedRates.forEach(r => formattedRates[r.type] = r.rate);

    res.json({ 
      success: true, 
      message: 'Gold rates updated successfully',
      data: formattedRates 
    });

  } catch (err) {
    console.error('Error updating gold rates:', err);
    
    // Handle duplicate key error from index
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A concurrent update was detected. Please try again.'
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to update gold rates. Please try again.' 
    });
  }
};
/* HISTORY + % CHANGE */
Controller.prototype.getRateHistory = async (req, res) => {
  try {
    const history = await GoldRate.aggregate([
      { $match: { isActive: false } },
      { $sort: { effectiveFrom: -1 } },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$effectiveFrom"
              }
            },
            type: "$type"
          },
          rate: { $first: "$rate" }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          rates: { $push: { type: "$_id.type", rate: "$rate" } }
        }
      }
    ]);

    const formatted = history.map((day, i, arr) => {
      const today = day.rates.find(r => r.type === '24k')?.rate || 0;
      const prev = arr[i + 1]?.rates.find(r => r.type === '24k')?.rate || today;

      return {
        date: day._id,
        rates: day.rates,
        changePercent: prev
          ? (((today - prev) / prev) * 100).toFixed(2)
          : '0.00'
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


module.exports = new Controller();
