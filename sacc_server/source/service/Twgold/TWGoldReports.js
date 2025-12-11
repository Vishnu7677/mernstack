const Branch = require('../../commons/models/mongo/documents/TWgoldBranch');
const Employee = require('../../commons/models/mongo/documents/TwGoldEmployee');
const Loan = require('../../commons/models/mongo/documents/TWGoldItems');

exports.getDashboardStats = async (req, res) => {
  try {
    // Get total branches
    const totalBranches = await Branch.countDocuments({ status: 'active' });
    
    // Get total employees
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    
    // Get active loans (you'll need to implement this based on your Loan model)
    const activeLoans = await Loan.countDocuments({ status: 'active' });
    
    // Get total gold weight (sum of gold in active loans)
    const totalGoldWeightResult = await Loan.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$goldWeight' } } }
    ]);
    const totalGoldWeight = totalGoldWeightResult[0]?.total || 0;
    
    // Get pending approvals
    const pendingApprovals = await Loan.countDocuments({ status: 'pending' });
    
    // Get total loan value
    const totalLoanValueResult = await Loan.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$loanAmount' } } }
    ]);
    const totalLoanValue = totalLoanValueResult[0]?.total || 0;
    
    // Format total loan value
    const formattedLoanValue = totalLoanValue >= 10000000 
      ? `₹${(totalLoanValue / 10000000).toFixed(1)}Cr`
      : `₹${(totalLoanValue / 100000).toFixed(1)}L`;

    // Get current gold rate (you'll need a GoldRate model)
    const currentGoldRate = '₹6,245'; // This should come from your GoldRate model

    res.json({
      success: true,
      data: {
        totalBranches,
        totalEmployees,
        activeLoans,
        totalGoldWeight,
        pendingApprovals,
        totalLoanValue: formattedLoanValue,
        currentGoldRate,
        branchesLastUpdated: new Date().toISOString(),
        employeesLastUpdated: new Date().toISOString(),
        loansLastUpdated: new Date().toISOString(),
        goldRateLastUpdated: new Date().toISOString(),
        loanValueLastUpdated: new Date().toISOString(),
        approvalsLastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};