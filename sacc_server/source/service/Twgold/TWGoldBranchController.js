const Branch = require('../../commons/models/mongo/documents/TWGoldBranch');
const ActivityLog = require('../../commons/models/mongo/documents/TWGoldActivityLog');
const User = require('../../commons/models/mongo/documents/TwGoldUser');

function Controller() {}

/**
 * CREATE BRANCH
 */
// In your controller file
Controller.prototype.createBranch = async (req, res) => {
  try {
    if (!req.body.manager) {
      return res.status(400).json({ message: 'Manager is required' });
    }
    const { managerLogin, ...safeData } = req.body;

const branch = await Branch.create({
  ...safeData,
  admin: req.user._id,
  createdBy: req.user._id
});

// Assign branch to manager
await User.findByIdAndUpdate(safeData.manager, {
  branch: branch._id
});

    await ActivityLog.logActivity({
      action: 'CREATE_BRANCH',
      module: 'branch',
      user: req.user._id,
      roleAtThatTime: req.user.role,
      branch: branch._id,
      targetEntity: {
        modelName: 'TWGoldBranch',
        entityId: branch._id
      },
      details: {
        branchCode: branch.branchCode,
        branchName: branch.branchName
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({ 
      success: true, 
      data: branch,
      message: 'Branch created successfully'
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    
    // Handle duplicate branch code
    if (error.code === 11000 && error.keyPattern?.branchCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Branch code already exists. Please try again.' 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log(error)
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create branch. Please try again.' 
    });
  }
};

/**
 * GET ALL BRANCHES
 */
Controller.prototype.getAllBranches = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, zone } = req.query;

    const query = {};
    if (status) query.status = status;
    if (zone) query.zone = new RegExp(zone, 'i');

    const branches = await Branch.find(query)
      .populate('manager', 'name email employeeId')
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Branch.countDocuments(query);

    res.json({
      success: true,
      data: {
        branches,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET BRANCH BY ID
 */
Controller.prototype.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate('manager', 'name email employeeId')
      .populate('admin', 'name email');

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    res.json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * UPDATE BRANCH
 */
Controller.prototype.updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    await ActivityLog.logActivity({
      action: 'UPDATE_BRANCH',
      module: 'branch',
      user: req.user._id,
      roleAtThatTime: req.user.role,
      branch: branch._id,
      targetEntity: {
        modelName: 'TWgoldBranch',
        entityId: branch._id
      },
      details: req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * BRANCH PERFORMANCE
 */
Controller.prototype.getBranchPerformance = async (req, res) => {
  try {
    const branches = await Branch.find({ status: 'active' })
      .select('branchName branchCode performance manager')
      .populate('manager', 'name')
      .sort({ 'performance.targetAchievement': -1 });

    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ADD EMPLOYEE TO BRANCH
 */
Controller.prototype.addEmployeeToBranch = async (req, res) => {
  try {
    const { branchId, employeeId } = req.params;

    const branch = await Branch.findById(branchId);
    const employee = await User.findById(employeeId);

    if (!branch || !employee) {
      return res.status(404).json({
        success: false,
        message: 'Branch or employee not found'
      });
    }

    employee.branch = branch._id;
    await employee.save();

    await ActivityLog.logActivity({
      action: 'ADD_EMPLOYEE_TO_BRANCH',
      module: 'branch',
      user: req.user._id,
      roleAtThatTime: req.user.role,
      branch: branch._id,
      targetEntity: {
        modelName: 'TWgoldUser',
        entityId: employee._id
      },
      details: {
        employeeName: employee.name,
        branchName: branch.branchName
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: 'Employee assigned to branch' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = new Controller();
