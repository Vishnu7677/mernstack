const express = require('express');
const ServiceManager = require('../../service/ServiceManager');
const { twgold_authMiddleware, twgold_requireRole } = require('../../middleware/TwGold/TWGoldauthMiddleware');

const router = express.Router();

// Public routes - Only admin registration is public
router.post('/register', ServiceManager.TWgoldLogin.registerAdmin); // Only for admin registration
router.post('/login', ServiceManager.TWgoldLogin.login);
router.post('/logout', ServiceManager.TWgoldLogin.logout);

// Protected routes
router.get('/profile', twgold_authMiddleware, ServiceManager.TWgoldLogin.getProfile);
router.put('/profile', twgold_authMiddleware, ServiceManager.TWgoldLogin.updateProfile);

// Aadhaar Verification Routes for Employee Creation
router.post('/employee/aadhaar/generate-otp', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin']), 
  ServiceManager.TWgoldLogin.generateEmployeeAadhaarOtp
);

router.post('/employee/aadhaar/verify-otp', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin']), 
  ServiceManager.TWgoldLogin.verifyEmployeeAadhaarOtp
);

router.post('/employee/create-with-aadhaar', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin']), 
  ServiceManager.TWgoldLogin.createEmployeeWithAadhaar
);

// Check Aadhaar verification status
router.get('/employee/aadhaar/status/:aadhaar_number',
  twgold_authMiddleware,
  twgold_requireRole(['admin']),
  ServiceManager.TWgoldLogin.getAadhaarVerificationStatus
);

// Protected creation routes - require authentication and specific roles
router.post('/employee/create', twgold_authMiddleware, twgold_requireRole(['admin']), ServiceManager.TWgoldLogin.createEmployee);
router.post('/manager/create', twgold_authMiddleware, twgold_requireRole(['admin']), ServiceManager.TWgoldLogin.createManager);
router.post('/grivirence/create', twgold_authMiddleware, twgold_requireRole(['admin']), ServiceManager.TWgoldLogin.createGrivirence);

// Add these routes after your existing routes in the router file

// Get all admins (Admin only)
router.get('/admins', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin']), 
  ServiceManager.TWgoldLogin.getAllAdmins
);

// Get all managers (Admin and Grivirence can access)
router.get('/managers', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin', 'grivirence']), 
  ServiceManager.TWgoldLogin.getAllManagers
);

// Get all employees (Admin, Manager, and Grivirence can access)
router.get('/employees', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin', 'manager', 'grivirence']), 
  ServiceManager.TWgoldLogin.getAllEmployees
);

// Get all grivirence officers (Admin only)
router.get('/grivirence', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin']), 
  ServiceManager.TWgoldLogin.getAllGrivirence
);

// Role-specific protected routes (examples)
router.get('/admin/dashboard', twgold_authMiddleware, twgold_requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Admin Dashboard',
    data: { adminData: 'Secret admin information' }
  });
});

router.get('/manager/dashboard', twgold_authMiddleware, twgold_requireRole(['manager']), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Manager Dashboard',
    data: { managerData: 'Manager specific information' }
  });
});

router.get('/employee/dashboard', twgold_authMiddleware, twgold_requireRole(['employee']), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Employee Dashboard',
    data: { employeeData: 'Employee specific information' }
  });
});

router.get('/grivirence/dashboard', twgold_authMiddleware, twgold_requireRole(['grivirence']), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Grivirence Dashboard',
    data: { grivirenceData: 'Grivirence specific information' }
  });
});

// Multi-role access example
router.get('/management/data', twgold_authMiddleware, twgold_requireRole(['admin', 'manager']), (req, res) => {
  res.json({
    success: true,
    message: 'Management data access granted',
    data: { managementData: 'Sensitive management information' }
  });
});

module.exports = router;