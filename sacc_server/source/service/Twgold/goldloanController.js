const Loan = require('../../commons/models/mongo/documents/TWGoldItems');
const Customer = require('../../commons/models/mongo/documents/TWGoldCustomer');
const GoldRate = require('../../commons/models/mongo/documents/TWGoldRates');
const ActivityLog = require('../../commons/models/mongo/documents/TWGoldActivityLog');

// Calculate LTV based interest rate
const calculateInterestRate = (ltv) => {
  if (ltv <= 55) {
    return (ltv / 55) * 8.3;
  } else if (ltv <= 85) {
    return 8.4 + ((ltv - 56) / 29) * (24 - 8.4);
  } else {
    return 24;
  }
};

function Controller() {}

// Create new loan (clerk)
Controller.prototype.createLoan = async function (req, res) {
  try {
    const { customerId, goldItems, requestedAmount, tenure } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const rates = await GoldRate.find({
      branch: req.user.branch,
      isActive: true
    });

    let totalGoldValue = 0;

    const processedItems = goldItems.map(item => {
      const goldType = item.carat.toLowerCase(); // "22K" → "22k"
    
      const rate = rates.find(r => r.type === goldType);
      if (!rate) throw new Error(`Gold rate missing for ${goldType}`);
    
      const value = item.weight * rate.rate;
      totalGoldValue += value;
    
      return {
        ...item,
        approvedValue: value,
        estimatedValue: value
      };
    });
    

    const ltv = (requestedAmount / totalGoldValue) * 100;
    if (ltv > 85) {
      return res.status(400).json({ success: false, message: 'LTV exceeds 85%' });
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

    // 🔥 Normalize "22K" → "22k"
    const goldType = carat.toLowerCase();

    const goldRate = await GoldRate.findOne({
      type: goldType,
      branch: req.user.branch,
      isActive: true
    });

    if (!goldRate) {
      return res.status(404).json({
        success: false,
        message: `Gold rate not found for ${goldType}`
      });
    }

    const goldValue = weight * goldRate.rate;
    const ltv = (requestedAmount / goldValue) * 100;
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