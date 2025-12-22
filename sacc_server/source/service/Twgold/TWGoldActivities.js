const ActivityLog = require('../../commons/models/mongo/documents/TWGoldActivitylog');
const Branch = require('../../commons/models/mongo/documents/TWGoldBranch');
const User = require('../../commons/models/mongo/documents/TwGoldUser');
const Loan = require('../../commons/models/mongo/documents/TWGoldItems');

function Controller() {}

/**
 * RECENT ACTIVITIES
 */
Controller.prototype.getRecentActivities = async (req, res) => {
  try {
    const { limit = 10, branchId, module } = req.query;

    const query = {};
    if (branchId) query.branch = branchId;
    if (module) query.module = module;

    const activities = await ActivityLog.find(query)
      .populate('user', 'name email')
      .populate('branch', 'branchName branchCode')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ACTIVITIES BY DATE RANGE
 */
Controller.prototype.getActivitiesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;

    const query = {
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    if (branchId) query.branch = branchId;

    const activities = await ActivityLog.find(query)
      .populate('user', 'name email')
      .populate('branch', 'branchName branchCode')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * USER ACTIVITIES
 */
Controller.prototype.getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const activities = await ActivityLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('branch', 'branchName');

    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DASHBOARD STATS
 */
Controller.prototype.getDashboardStats = async (req, res) => {
  try {
    const totalBranches = await Branch.countDocuments({ status: 'active' });
    const totalEmployees = await User.countDocuments({ isActive: true });
    const activeLoans = await Loan.countDocuments({ status: 'active' });

    const goldAgg = await Loan.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$goldItems' },
      { $group: { _id: null, totalWeight: { $sum: '$goldItems.netWeight' } } }
    ]);

    const loanAgg = await Loan.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalAmount: { $sum: '$sanctionedAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalBranches,
        totalEmployees,
        activeLoans,
        totalGoldWeight: goldAgg[0]?.totalWeight || 0,
        totalLoanValue: loanAgg[0]?.totalAmount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = new Controller();
