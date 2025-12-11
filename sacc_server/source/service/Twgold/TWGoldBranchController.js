const Branch = require('../../commons/models/mongo/documents/TWGoldBranches');
const ActivityLog = require('../../commons/models/mongo/documents/TWGoldActivitylog');
const Employee = require('../../commons/models/mongo/documents/TwGoldEmployee');


exports.createBranch = async (req, res) => {
  try {
    const branchData = {
      ...req.body,
      admin: req.user.id
    };

    const branch = new Branch(branchData);
    await branch.save();

    // Log activity
    await ActivityLog.logActivity({
      action: `Branch created: ${branch.branchName}`,
      module: 'branch',
      user: req.user.id,
      userRole: req.user.role,
      branch: branch._id,
      targetEntity: {
        entityType: 'branch',
        entityId: branch._id
      },
      details: {
        branchCode: branch.branchCode,
        branchName: branch.branchName
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Branch created successfully',
      data: { branch }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating branch',
      error: error.message
    });
  }
};

exports.getAllBranches = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, zone } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (zone) query.zone = new RegExp(zone, 'i');
    
    const branches = await Branch.find(query)
      .populate('manager', 'name email')
      .populate('employees', 'name position')
      .populate('grivirenceOfficers', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Branch.countDocuments(query);

    res.json({
      success: true,
      data: {
        branches,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching branches',
      error: error.message
    });
  }
};

exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate('manager')
      .populate('employees')
      .populate('grivirenceOfficers')
      .populate('admin');

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    res.json({
      success: true,
      data: { branch }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching branch',
      error: error.message
    });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Log activity
    await ActivityLog.logActivity({
      action: `Branch updated: ${branch.branchName}`,
      module: 'branch',
      user: req.user.id,
      userRole: req.user.role,
      branch: branch._id,
      targetEntity: {
        entityType: 'branch',
        entityId: branch._id
      },
      details: req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Branch updated successfully',
      data: { branch }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating branch',
      error: error.message
    });
  }
};

exports.getBranchPerformance = async (req, res) => {
  try {
    const branches = await Branch.find({ status: 'active' })
      .select('branchName branchCode performance address manager')
      .populate('manager', 'name')
      .sort({ 'performance.targetAchievement': -1 });

    res.json({
      success: true,
      data: {
        performance: branches,
        totalBranches: branches.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching branch performance',
      error: error.message
    });
  }
};

exports.addEmployeeToBranch = async (req, res) => {
  try {
    const { branchId, employeeId } = req.params;
    
    const branch = await Branch.findById(branchId);
    const employee = await Employee.findById(employeeId);

    if (!branch || !employee) {
      return res.status(404).json({
        success: false,
        message: 'Branch or employee not found'
      });
    }

    await branch.addEmployee(employeeId);
    employee.assignedBranch = branch.branchName;
    await employee.save();

    // Log activity
    await ActivityLog.logActivity({
      action: `Employee added to branch: ${employee.name}`,
      module: 'branch',
      user: req.user.id,
      userRole: req.user.role,
      branch: branch._id,
      targetEntity: {
        entityType: 'employee',
        entityId: employee._id
      },
      details: {
        employeeName: employee.name,
        branchName: branch.branchName
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Employee added to branch successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding employee to branch',
      error: error.message
    });
  }
};