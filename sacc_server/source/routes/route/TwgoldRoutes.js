const express = require('express');
const ServiceManager = require('../../service/ServiceManager');
const { 
  twgold_authMiddleware, 
  twgold_requireRole,
  twgold_checkPermission 
} = require('../../middleware/TwGold/TWGoldauthMiddleware');

const router = express.Router();

// Public routes - Only admin registration is public
router.post('/register', ServiceManager.TWgoldLogin.registerAdmin);
router.post('/login', ServiceManager.TWgoldLogin.login);
router.post('/logout', ServiceManager.TWgoldLogin.logout);
router.post('/refresh-token', ServiceManager.TWgoldLogin.refreshToken);
/* =========================================================
   🔐 AUTH MIDDLEWARE (APPLIED TO ALL ROUTES BELOW)
========================================================= */
router.use(twgold_authMiddleware);
// Protected routes
router.get('/profile', ServiceManager.TWgoldLogin.getProfile);
router.put('/profile', ServiceManager.TWgoldLogin.updateProfile);
router.put('/change-password', ServiceManager.TWgoldLogin.changePassword);

// Aadhaar Verification Routes for User Creation (all roles except admin)
router.post('/user/aadhaar/generate-otp',
  twgold_checkPermission('employee_management', 'write'),
  ServiceManager.TWgoldLogin.generateUserAadhaarOtp
);

router.post('/user/aadhaar/verify-otp',
  twgold_checkPermission('employee_management', 'write'),
  ServiceManager.TWgoldLogin.verifyUserAadhaarOtp
);

// Unified user creation with Aadhaar (for all roles except admin)
router.post('/user/create-with-aadhaar',
  twgold_checkPermission('employee_management', 'write'),
  ServiceManager.TWgoldLogin.createUserWithAadhaar
);
// Add this route
router.post('/user/aadhaar/get-verified-details',
  twgold_checkPermission('employee_management', 'read'),
  ServiceManager.TWgoldLogin.getVerifiedAadhaarDetails
);

// User creation without Aadhaar (for all roles except admin)
router.post('/user/create',
  twgold_checkPermission('employee_management', 'write'),
  ServiceManager.TWgoldLogin.createUser
);

// Check Aadhaar verification status
router.get('/user/aadhaar/status/:aadhaar_number',
  twgold_checkPermission('employee_management', 'read'),
  ServiceManager.TWgoldLogin.getAadhaarVerificationStatus
);

// Get all users with role-based access
router.get('/admins',
  twgold_checkPermission('system_admin', 'read'),
  ServiceManager.TWgoldLogin.getAllAdmins
);

router.get('/users',
  twgold_checkPermission('employee_management', 'read'),
  ServiceManager.TWgoldLogin.getAllUsers
);

router.get('/users/role/:role',
  twgold_checkPermission('employee_management', 'read'),
  ServiceManager.TWgoldLogin.getUsersByRole
);

// Get users by branch/department
router.get('/branch/:branch/users',
  twgold_checkPermission('employee_management', 'read'),
  ServiceManager.TWgoldLogin.getUsersByBranch
);

router.get('/department/:department/users',  twgold_checkPermission('employee_management', 'read'),
  ServiceManager.TWgoldLogin.getUsersByDepartment
);

// Update user status/permissions
router.put('/user/:id/status',
  twgold_checkPermission('employee_management', 'manage'),
  ServiceManager.TWgoldLogin.updateUserStatus
);

router.put('/user/:id/permissions',
  twgold_checkPermission('system_admin', 'manage'),
  ServiceManager.TWgoldLogin.updateUserPermissions
);

// Role-specific dashboards
router.get('/admin/dashboard', 
  twgold_requireRole(['admin']),
  twgold_checkPermission('system_admin', 'read'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Admin Dashboard',
      data: { adminData: 'Secret admin information' }
    });
  }
);

router.get('/manager/dashboard',  
  twgold_requireRole(['manager']),
  twgold_checkPermission('loan_management', 'approve'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Manager Dashboard',
      data: { managerData: 'Manager specific information' }
    });
  }
);

router.get('/employee/dashboard',  
  twgold_requireRole(['employee']),
  twgold_checkPermission('customer_management', 'read'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Employee Dashboard',
      data: { employeeData: 'Employee specific information' }
    });
  }
);

router.get('/grivirence/dashboard', 
  twgold_requireRole(['grivirence']),
  twgold_checkPermission('reporting', 'write'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Welcome to Grivirence Dashboard',
      data: { grivirenceData: 'Grivirence specific information' }
    });
  }
);

// Multi-role access example
router.get('/management/data',  
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('loan_management', 'approve'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Management data access granted',
      data: { managementData: 'Sensitive management information' }
    });
  }
);

module.exports = router;