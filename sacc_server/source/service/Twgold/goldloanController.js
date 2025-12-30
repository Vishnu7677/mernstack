const Loan = require('../../commons/models/mongo/documents/TWGoldItems');
const Customer = require('../../commons/models/mongo/documents/TWGoldCustomer');
const DailyGoldRate = require('../../commons/models/mongo/documents/TWGoldRates');
const ActivityLog = require('../../commons/models/mongo/documents/TWGoldActivitylog');

// Calculate LTV based interest rate// Calculate LTV based interest rate
const calculateInterestRate = (ltv) => {
  let rate;

  if (ltv <= 55) {
    rate = (ltv / 55) * 8.3;
  } else if (ltv <= 85) {
    rate = 8.4 + ((ltv - 56) / 29) * (24 - 8.4);
  } else {
    rate = 24;
  }

  // ✅ Enforce minimum interest rate
  return Math.max(rate, 8.3);
};


const normalizeCarat = (carat) => carat.toUpperCase();

const getLatestGoldRate = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return DailyGoldRate.findOne({
    date: { $lte: today }
  })
    .sort({ date: -1 })
    .select('rates date');
};
const getPurityPercentage = (carat) => {
  const k = parseInt(carat);
  if (isNaN(k)) return 0;
  return parseFloat(((k / 24) * 100).toFixed(2));
};

function Controller() {}

// Create new loan (clerk)
Controller.prototype.createLoan = async function (req, res) {
  try {
    const { customerId, goldItems, requestedAmount, tenure } = req.body;

    const customer = await Customer.findOne({ customerId });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const dailyRate = await getLatestGoldRate();
    if (!dailyRate) {
      return res.status(404).json({ success: false, message: 'Gold rate not available' });
    }

    let totalGoldValue = 0;

    const processedItems = goldItems.map(item => {
      const caratKey = normalizeCarat(item.carat);
      const ratePerGram = dailyRate.rates[caratKey];

      if (!ratePerGram) {
        throw new Error(`Gold rate missing for ${caratKey}`);
      }

      const value = item.weight * ratePerGram;
      totalGoldValue += value;

      return {
        ...item,
        purity: getPurityPercentage(item.carat), // Converts '18K' -> 75
        approvedValue: value,
        estimatedValue: value,
        ratePerGram,
        rateDate: dailyRate.date
      };
    });

    const ltv = (requestedAmount / totalGoldValue) * 100;

    // Hard Validations
    if (ltv < 50 || ltv > 85) {
      return res.status(400).json({
        success: false,
        message: `Invalid LTV: ${ltv.toFixed(2)}%. Must be between 50% and 85%.`
      });
    }

    const loan = new Loan({
      customer: customer._id,
      branch: req.user.branch,
      createdBy: req.user.id,
      goldItems: processedItems,
      totalGoldWeight: goldItems.reduce((s, i) => s + i.weight, 0),
      requestedAmount,
      sanctionedAmount: requestedAmount, // Initially requested
      loanToValueRatio: ltv,
      interestRate: calculateInterestRate(ltv),
      tenure,
      repaymentType: 'emi', // Ensures EMI virtuals work
      status: 'pending_approval',
      startDate: new Date(),
      goldRateUsed: {
        carat: goldItems[0].carat,
        rate: dailyRate.rates[normalizeCarat(goldItems[0].carat)],
        goldRateId: dailyRate._id
      }
    });

    await loan.save();

    res.status(201).json({
      success: true,
      data: { loanId: loan.loanAccountNumber, rateDate: dailyRate.date }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// Get loans for clerk
Controller.prototype.getMyLoans = async function (req, res) {
  try {
    const loans = await Loan.find({ createdBy: req.user.id })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: loans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Calculate loan details (for preview)
Controller.prototype.calculateLoan = async function (req, res) {
  try {
    let { carat, weight, requestedAmount, tenure } = req.body;

    if (!carat || !weight || !requestedAmount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Fetch LAST UPDATED gold rate (not strictly today)
    const dailyRate = await DailyGoldRate.findOne({
      date: { $lte: today }
    })
      .sort({ date: -1 })
      .select('rates date');

    if (!dailyRate) {
      return res.status(404).json({
        success: false,
        message: 'Gold rate not available'
      });
    }

    const caratKey = normalizeCarat(carat);
    const ratePerGram = dailyRate.rates[caratKey];

    if (!ratePerGram) {
      return res.status(404).json({
        success: false,
        message: `Gold rate not found for ${caratKey}`
      });
    }

    const goldValue = weight * ratePerGram;
    const ltv = (requestedAmount / goldValue) * 100;

    // ✅ Block invalid LTV in preview
    if (ltv < 50) {
      return res.status(400).json({
        success: false,
        message: 'Requested amount should be at least 50% of gold value'
      });
    }
    
    if (ltv > 85) {
      return res.status(400).json({
        success: false,
        message: 'Requested amount exceeds maximum permissible LTV of 85%'
      });
    }
    

    const interestRate = calculateInterestRate(ltv);
    const monthlyRate = interestRate / 12 / 100;

    const emi =
      requestedAmount *
      monthlyRate *
      Math.pow(1 + monthlyRate, tenure) /
      (Math.pow(1 + monthlyRate, tenure) - 1);

    res.json({
      success: true,
      data: {
        goldValue: Math.round(goldValue),
        ltv,
        interestRate,
        emiAmount: Math.round(emi),
        totalInterest: Math.round(emi * tenure - requestedAmount),
        rateDate: dailyRate.date // ✅ helpful for UI
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};





// Collect EMI
Controller.prototype.collectEMI = async function (req, res) {
  try {
    const { loanId, amount, paymentMethod, transactionId } = req.body;

    const loan = await Loan.findOne({
      loanAccountNumber: loanId,
      branch: req.user.branch
    });

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    loan.transactions.push({
      type: 'principal_payment',
      amount,
      paymentMethod,
      transactionId,
      processedBy: req.user.id
    });

    loan.outstandingPrincipal -= amount;
    loan.totalPaid += amount;
    loan.lastPaymentDate = new Date();

    await loan.save();

    await ActivityLog.logActivity({
      action: 'EMI collected',
      module: 'loan',
      user: req.user.id,
      roleAtThatTime: req.user.role,
      branch: req.user.branch,
      targetEntity: {
        entityId: loan._id,
        modelName: 'TWGoldLoan'
      },
      details: {
        loanAccountNumber: loan.loanAccountNumber,
        amount,
        paymentMethod
      }
    });

    res.json({
      success: true,
      message: 'EMI collected successfully'
    });
  } catch (err) {
    await ActivityLog.logActivity({
      action: 'EMI collection failed',
      module: 'loan',
      user: req.user.id,
      roleAtThatTime: req.user.role,
      branch: req.user.branch,
      status: 'failure',
      errorMessage: err.message
    });

    res.status(500).json({ success: false, message: err.message });
  }
};


// 1. Get all loans waiting for Manager Approval
Controller.prototype.getPendingLoans = async function (req, res) {
  try {
    const loans = await Loan.find({ 
      branch: req.user.branch, 
      status: 'pending_approval' 
    })
    .populate('customer', 'name phone')
    .populate('createdBy', 'name employeeId')
    .sort({ createdAt: -1 });

    res.json({ success: true, data: loans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Approve or Reject a Loan
Controller.prototype.approveOrRejectLoan = async function (req, res) {
  try {
    const { loanId } = req.params; // This is the loanAccountNumber
    const { decision, remarks, finalSanctionedAmount } = req.body;

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Invalid decision' });
    }

    const loan = await Loan.findOne({ 
      loanAccountNumber: loanId, 
      branch: req.user.branch 
    });

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan account not found' });
    }

    if (loan.status !== 'pending_approval') {
      return res.status(400).json({ success: false, message: 'Loan is not in pending state' });
    }

    if (decision === 'approve') {
      loan.status = 'approved';
      loan.approvedBy = req.user.id;
      // Manager can override the sanctioned amount if needed
      loan.sanctionedAmount = finalSanctionedAmount || loan.requestedAmount;
      loan.disbursementDate = new Date();
      loan.outstandingPrincipal = loan.sanctionedAmount; // Update principal based on final sanction
      loan.remarks = remarks || 'Approved by Manager';
    } else {
      loan.status = 'rejected';
      loan.remarks = remarks || 'Rejected by Manager';
    }

    await loan.save();

    // Log the activity
    await ActivityLog.logActivity({
      action: `Loan ${decision}d`,
      module: 'loan',
      user: req.user.id,
      branch: req.user.branch,
      details: { loanAccountNumber: loanId, remarks }
    });

    res.json({ 
      success: true, 
      message: `Loan has been ${decision}d successfully`,
      data: { status: loan.status }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

Controller.prototype.dashboardStats = async function (req, res) {
  try {
    const branchId = req.user.branch;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      pendingApprovals,
      activeLoans,
      totalGold,
      todayDisbursement,
      approvedToday,
      rejectedToday
    ] = await Promise.all([
      Loan.aggregate([
        { $match: { branch: branchId, status: 'pending_approval' } },
        { $count: 'count' }
      ]),

      Loan.aggregate([
        {
          $match: {
            branch: branchId,
            status: { $in: ['active', 'overdue', 'npa'] }
          }
        },
        { $count: 'count' }
      ]),

      Loan.aggregate([
        {
          $match: {
            branch: branchId,
            status: { $in: ['approved', 'active', 'overdue', 'npa'] }
          }
        },
        {
          $group: {
            _id: null,
            totalGold: { $sum: '$totalGoldWeight' }
          }
        }
      ]),

      Loan.aggregate([
        {
          $match: {
            branch: branchId,
            status: { $in: ['approved', 'active'] },
            disbursementDate: { $gte: todayStart }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$sanctionedAmount' }
          }
        }
      ]),

      Loan.aggregate([
        {
          $match: {
            branch: branchId,
            status: 'approved',
            updatedAt: { $gte: todayStart }
          }
        },
        { $count: 'count' }
      ]),

      Loan.aggregate([
        {
          $match: {
            branch: branchId,
            status: 'rejected',
            updatedAt: { $gte: todayStart }
          }
        },
        { $count: 'count' }
      ])
    ]);

    res.json({
      success: true,
      data: {
        pendingApprovals: pendingApprovals[0]?.count || 0,
        activeLoans: activeLoans[0]?.count || 0,
        totalGold: totalGold[0]?.totalGold || 0,
        todayDisbursement: todayDisbursement[0]?.total || 0,
        approvedToday: approvedToday[0]?.count || 0,
        rejectedToday: rejectedToday[0]?.count || 0
      }
    });

  } catch (err) {
    console.error('Manager dashboard error:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to load manager dashboard',
      error: err.message
    });
  }
};


Controller.prototype.slaBuckets = async function (req, res) {
  try {
    const branchId = req.user.branch;

    const buckets = await Loan.aggregate([
      {
        $match: {
          branch: branchId,
          status: 'pending_approval'
        }
      },
      {
        $project: {
          hoursPending: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$hoursPending',
          boundaries: [0, 24, 48, 100000],
          default: 'unknown',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    const response = {
      '0-24h': 0,
      '24-48h': 0,
      '48h+': 0
    };

    buckets.forEach(b => {
      if (b._id === 0) response['0-24h'] = b.count;
      if (b._id === 24) response['24-48h'] = b.count;
      if (b._id === 48) response['48h+'] = b.count;
    });

    res.json({
      success: true,
      data: response
    });

  } catch (err) {
    console.error('SLA bucket error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load SLA buckets',
      error: err.message
    });
  }
};


Controller.prototype.monthlyStats = async function (req, res) {
  try {
    const branchId = req.user.branch;

    const approvalTrend = await Loan.aggregate([
      {
        $match: {
          branch: branchId,
          status: { $in: ['approved', 'rejected'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          approved: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'approved'] }, '$count', 0]
            }
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'rejected'] }, '$count', 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const disbursementTrend = await Loan.aggregate([
      {
        $match: {
          branch: branchId,
          status: { $in: ['approved', 'active'] },
          disbursementDate: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$disbursementDate' },
            month: { $month: '$disbursementDate' }
          },
          totalDisbursed: { $sum: '$sanctionedAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const goldTrend = await Loan.aggregate([
      {
        $match: {
          branch: branchId,
          status: { $in: ['approved', 'active', 'overdue', 'npa'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          goldWeight: { $sum: '$totalGoldWeight' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        approvalTrend,
        disbursementTrend,
        goldTrend
      }
    });

  } catch (err) {
    console.error('Monthly stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load monthly statistics',
      error: err.message
    });
  }
};

Controller.prototype.branchComparison = async function (req, res) {
  try {
    const comparison = await Loan.aggregate([
      {
        $match: {
          status: { $in: ['active', 'overdue', 'npa'] }
        }
      },
      {
        $group: {
          _id: '$branch',
          activeLoans: { $sum: 1 },
          totalGold: { $sum: '$totalGoldWeight' },
          totalOutstanding: { $sum: '$outstandingPrincipal' }
        }
      },
      {
        $lookup: {
          from: 'twgoldbranches',
          localField: '_id',
          foreignField: '_id',
          as: 'branch'
        }
      },
      { $unwind: '$branch' },
      {
        $project: {
          branchId: '$_id',
          branchName: '$branch.branchName',
          activeLoans: 1,
          totalGold: 1,
          totalOutstanding: 1
        }
      },
      { $sort: { totalOutstanding: -1 } }
    ]);

    res.json({
      success: true,
      data: comparison
    });

  } catch (err) {
    console.error('Branch comparison error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load branch comparison',
      error: err.message
    });
  }
};


module.exports = new Controller();