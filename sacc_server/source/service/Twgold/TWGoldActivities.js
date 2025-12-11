const ActivityLog = require('../../commons/models/mongo/documents/TWGoldActivitylog');

exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 10, branchId, module } = req.query;
    
    let query = {};
    if (branchId) query.branch = branchId;
    if (module) query.module = module;

    const activities = await ActivityLog.find(query)
      .populate('user', 'name email')
      .populate('branch', 'branchName branchCode')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        activities,
        total: activities.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message
    });
  }
};

exports.getActivitiesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, branchId, userRole } = req.query;
    
    const query = {
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    if (branchId) query.branch = branchId;
    if (userRole) query.userRole = userRole;

    const activities = await ActivityLog.find(query)
      .populate('user', 'name email')
      .populate('branch', 'branchName branchCode')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      data: {
        activities,
        total: activities.length,
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activities by date range',
      error: error.message
    });
  }
};

exports.getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const activities = await ActivityLog.getUserActivities(userId, limit);

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user activities',
      error: error.message
    });
  }
};