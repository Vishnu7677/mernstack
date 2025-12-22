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

function Controller() {}

// Create new loan (clerk)
Controller.prototype.createLoan = async function (req, res) {
  try {
    const { customerId, goldItems, requestedAmount, tenure } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // 🔥 Fetch today’s gold rate
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyRate = await DailyGoldRate.findOne({ date: today });
    if (!dailyRate) {
      return res.status(404).json({
        success: false,
        message: 'Today gold rate not available'
      });
    }

    let totalGoldValue = 0;

    const processedItems = goldItems.map(item => {
      const caratKey = normalizeCarat(item.carat); // "22k" → "22K"
      const ratePerGram = dailyRate.rates[caratKey];

      if (!ratePerGram) {
        throw new Error(`Gold rate missing for ${caratKey}`);
      }

      const value = item.weight * ratePerGram;
      totalGoldValue += value;

      return {
        ...item,
        approvedValue: value,
        estimatedValue: value
      };
    });

    const ltv = (requestedAmount / totalGoldValue) * 100;

    if (ltv > 85) {
      return res.status(400).json({
        success: false,
        message: 'Loan cannot be created. LTV exceeds maximum allowed limit of 85%'
      });
    }    

    const loan = new Loan({
      customer: customerId,
      branch: req.user.branch,
      createdBy: req.user.id,
      goldItems: processedItems,
      totalGoldWeight: goldItems.reduce((s, i) => s + i.weight, 0),
      requestedAmount,
      sanctionedAmount: requestedAmount,
      loanToValueRatio: ltv,
      interestRate: calculateInterestRate(ltv),
      tenure,
      status: 'pending_approval',
      startDate: new Date()
    });

    await loan.save();

    res.status(201).json({
      success: true,
      data: { loanId: loan.loanAccountNumber }
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
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyRate = await DailyGoldRate.findOne({ date: today });
    if (!dailyRate) {
      return res.status(404).json({
        success: false,
        message: 'Today gold rate not available'
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

// ✅ Block invalid LTV in preview itself
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
        totalInterest: Math.round(emi * tenure - requestedAmount)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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


Controller.prototype.getPendingLoans = async function (req, res) {
  try {
    const loans = await Loan.find({
      branch: req.user.branch,
      status: 'pending_approval'
    })
      .populate('customer', 'name phone')
      .populate('createdBy', 'name employeeId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: loans
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

Controller.prototype.approveOrRejectLoan = async function (req, res) {
  try {
    const { loanId } = req.params;
    const { decision, remarks } = req.body;

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be approve or reject'
      });
    }

    const loan = await Loan.findOne({
      loanAccountNumber: loanId,
      branch: req.user.branch,
      status: 'pending_approval'
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found or not pending approval'
      });
    }

    if (decision === 'approve') {
      loan.status = 'approved';
      loan.approvedBy = req.user.id;
      loan.sanctionedAmount = loan.requestedAmount;
      loan.disbursementDate = new Date();
    } else {
      loan.status = 'rejected';
      loan.remarks = remarks || 'Rejected by manager';
    }

    await loan.save();

    await ActivityLog.logActivity({
      action: `Loan ${decision}d`,
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
        decision,
        remarks
      }
    });

    res.json({
      success: true,
      message: `Loan ${decision}d successfully`
    });

  } catch (err) {
    await ActivityLog.logActivity({
      action: 'Loan approval/rejection failed',
      module: 'loan',
      user: req.user.id,
      roleAtThatTime: req.user.role,
      branch: req.user.branch,
      status: 'failure',
      errorMessage: err.message
    });

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


module.exports = new Controller();