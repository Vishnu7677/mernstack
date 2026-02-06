const express = require('express');
const router = express.Router();
const ServiceManager = require('../../service/ServiceManager');
const {
  twgold_authMiddleware,
  twgold_requireRole,
  twgold_checkPermission,
  twgold_checkScope
} = require('../../middleware/TwGold/TWGoldauthMiddleware');

/* =========================================================
    🔐 AUTH MIDDLEWARE (APPLIED TO ALL ROUTES)
========================================================= */
router.use(twgold_authMiddleware);

/* =========================================================
    🏦 BRANCH MANAGEMENT ROUTES
========================================================= */

router.post(
  '/branches',
  twgold_requireRole(['admin']),
  twgold_checkPermission('system_admin', 'manage'),
  ServiceManager.TWgoldBranches.createBranch
);

router.get(
  '/branches',
  // twgold_requireRole(['admin', 'manager', 'rm', 'zm']), // Uncomment as needed
  ServiceManager.TWgoldBranches.getAllBranches
);

router.get(
  '/branches-performance',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldBranches.getBranchPerformance
);

router.get(
  '/branches/:id',
  twgold_requireRole(['admin', 'manager', 'rm', 'zm']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldBranches.getBranchById
);

router.put(
  '/branches/:id',
  twgold_requireRole(['admin']),
  twgold_checkPermission('system_admin', 'manage'),
  ServiceManager.TWgoldBranches.updateBranch
);

/* =========================================================
    👥 EMPLOYEE–BRANCH ACTION ROUTES
========================================================= */

// NEW: Search Employees (Utility for UI dropdowns/filters)
router.get(
  '/employees/search',
  twgold_requireRole(['admin', 'manager', 'rm', 'zm']),
  ServiceManager.TWgoldBranches.searchEmployees
);

// Assign Single Employee to Branch
router.post(
  '/branches/:branchId/employees/:employeeId',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('employee_management', 'write'),
  twgold_checkScope('branch'),
  ServiceManager.TWgoldBranches.addEmployeeToBranch
);

// NEW: Bulk Assign Employees to Branch
router.post(
  '/branches/:branchId/employees-bulk',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('employee_management', 'write'),
  twgold_checkScope('branch'),
  ServiceManager.TWgoldBranches.addEmployeesToBranch
);

// Remove Employee from Branch
router.delete(
  '/branches/:branchId/employees/:employeeId',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('employee_management', 'manage'),
  twgold_checkScope('branch'),
  ServiceManager.TWgoldBranches.removeEmployeeFromBranch
);

// Transfer Employee between branches
router.post(
  '/employees/:employeeId/transfer',
  twgold_requireRole(['admin', 'rm', 'zm']),
  twgold_checkPermission('employee_management', 'manage'),
  ServiceManager.TWgoldBranches.transferEmployee
);

// Get History of branch movements
router.get(
  '/employees/:employeeId/branch-history',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldBranches.getEmployeeBranchHistory
);

/* =========================================================
    📜 ACTIVITY LOG ROUTES
========================================================= */

router.get(
  '/activities/recent',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldActivities.getRecentActivities
);

router.get(
  '/activities/date-range',
  twgold_requireRole(['admin']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldActivities.getActivitiesByDateRange
);

router.get(
  '/activities/user/:userId',
  twgold_requireRole(['admin']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldActivities.getUserActivities
);

/* =========================================================
    📊 DASHBOARD ROUTES
========================================================= */

router.get(
  '/dashboard/stats',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldActivities.getDashboardStats
);

module.exports = router;