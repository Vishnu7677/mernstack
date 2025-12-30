const Branch = require('../../commons/models/mongo/documents/TWGoldBranch');
const ActivityLog = require('../../commons/models/mongo/documents/TWGoldActivitylog');
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
/* =========================================================
   ADD MULTIPLE EMPLOYEES (BULK)
========================================================= */
Controller.prototype.addEmployeesToBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { employees = [] } = req.body;

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employees array is required'
      });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    const users = await User.find({ _id: { $in: employees } });

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: 'No valid employees found'
      });
    }

    await Promise.all(
      users.map(async user => {
        user.branch = branch._id;
        await user.save();

        await ActivityLog.logActivity({
          action: 'ADD_EMPLOYEE_TO_BRANCH',
          module: 'branch',
          user: req.user._id,
          roleAtThatTime: req.user.role,
          branch: branch._id,
          targetEntity: {
            modelName: 'TWgoldUser',
            entityId: user._id
          },
          details: {
            employeeName: user.name,
            branchName: branch.branchName
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      })
    );

    res.json({
      success: true,
      message: 'Employees assigned to branch successfully',
      count: users.length
    });

  } catch (error) {
    console.error('Bulk employee assignment error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to assign employees to branch'
    });
  }
};


/* =========================================================
   🔍 SEARCH EMPLOYEES (FOR UI)
========================================================= */
Controller.prototype.searchEmployees = async (req, res) => {
  try {
    const { q = '', role, branch, limit = 20 } = req.query;

    const query = {};

    if (q) {
      query.name = new RegExp(q, 'i');
    }

    if (role) {
      query.role = role;
    }

    if (branch) {
      query.branch = branch;
    }

    const users = await User.find(query)
      .select('name employeeId role branch')
      .limit(Math.min(Number(limit), 100)) // safety cap
      .sort({ name: 1 });

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Employee search error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to search employees'
    });
  }
};

/* =========================================================
   REMOVE EMPLOYEE FROM BRANCH
========================================================= */
Controller.prototype.removeEmployeeFromBranch = async (req, res) => {
  try {
    const { branchId, employeeId } = req.params;

    const branch = await Branch.findById(branchId);
    const user = await User.findById(employeeId);

    if (!branch || !user) {
      return res.status(404).json({
        success: false,
        message: 'Branch or employee not found'
      });
    }

    if (!user.branch || user.branch.toString() !== branchId) {
      return res.status(400).json({
        success: false,
        message: 'Employee does not belong to this branch'
      });
    }

    user.branch = null;
    await user.save();

    await ActivityLog.logActivity({
      action: 'REMOVE_EMPLOYEE_FROM_BRANCH',
      module: 'branch',
      user: req.user._id,
      roleAtThatTime: req.user.role,
      branch: branch._id,
      targetEntity: {
        modelName: 'TWgoldUser',
        entityId: user._id
      },
      details: {
        employeeName: user.name,
        branchName: branch.branchName
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Employee removed from branch successfully'
    });

  } catch (error) {
    console.error('Remove employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove employee from branch'
    });
  }
};

/* =========================================================
   TRANSFER EMPLOYEE BETWEEN BRANCHES
========================================================= */
Controller.prototype.transferEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { toBranchId } = req.body;

    if (!toBranchId) {
      return res.status(400).json({
        success: false,
        message: 'Target branch is required'
      });
    }

    const user = await User.findById(employeeId);
    const newBranch = await Branch.findById(toBranchId);

    if (!user || !newBranch) {
      return res.status(404).json({
        success: false,
        message: 'Employee or target branch not found'
      });
    }

    const fromBranchId = user.branch;

    user.branch = newBranch._id;
    await user.save();

    await ActivityLog.logActivity({
      action: 'TRANSFER_EMPLOYEE',
      module: 'branch',
      user: req.user._id,
      roleAtThatTime: req.user.role,
      branch: newBranch._id,
      targetEntity: {
        modelName: 'TWgoldUser',
        entityId: user._id
      },
      details: {
        employeeName: user.name,
        fromBranch: fromBranchId,
        toBranch: newBranch.branchName
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Employee transferred successfully'
    });

  } catch (error) {
    console.error('Transfer employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transfer employee'
    });
  }
};

/* =========================================================
   EMPLOYEE BRANCH ASSIGNMENT HISTORY
========================================================= */
Controller.prototype.getEmployeeBranchHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const logs = await ActivityLog.find({
      'targetEntity.entityId': employeeId,
      action: {
        $in: [
          'ADD_EMPLOYEE_TO_BRANCH',
          'REMOVE_EMPLOYEE_FROM_BRANCH',
          'TRANSFER_EMPLOYEE'
        ]
      }
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: logs
    });

  } catch (error) {
    console.error('Employee history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee branch history'
    });
  }
};


module.exports = new Controller();
