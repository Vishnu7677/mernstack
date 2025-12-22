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
   🔐 AUTH MIDDLEWARE (APPLIED TO ALL ROUTES BELOW)
========================================================= */
router.use(twgold_authMiddleware);

/* =========================================================
   🏦 BRANCH MANAGEMENT ROUTES
========================================================= */

/**
 * Create Branch
 * ADMIN ONLY
 */
router.post(
  '/branches',
  twgold_requireRole(['admin']),
  twgold_checkPermission('system_admin', 'manage'),
  ServiceManager.TWgoldBranches.createBranch
);

/**
 * Get All Branches
 * ADMIN, MANAGER
 */
router.get(
  '/branches',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldBranches.getAllBranches
);

/**
 * Get Branch by ID
 * ADMIN, MANAGER
 */
router.get(
  '/branches/:id',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldBranches.getBranchById
);

/**
 * Update Branch
 * ADMIN ONLY
 */
router.put(
  '/branches/:id',
  twgold_requireRole(['admin']),
  twgold_checkPermission('system_admin', 'manage'),
  ServiceManager.TWgoldBranches.updateBranch
);

/**
 * Branch Performance Dashboard
 * ADMIN, MANAGER
 */
router.get(
  '/branches-performance',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldBranches.getBranchPerformance
);

/**
 * Assign Employee to Branch
 * ADMIN, MANAGER (Branch scope)
 */
router.post(
  '/branches/:branchId/employees/:employeeId',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('employee_management', 'write'),
  twgold_checkScope('branch'),
  ServiceManager.TWgoldBranches.addEmployeeToBranch
);

/* =========================================================
   📜 ACTIVITY LOG ROUTES
========================================================= */

/**
 * Recent Activities
 * ADMIN, MANAGER
 */
router.get(
  '/activities/recent',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldActivities.getRecentActivities
);

/**
 * Activities by Date Range
 * ADMIN ONLY
 */
router.get(
  '/activities/date-range',
  twgold_requireRole(['admin']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldActivities.getActivitiesByDateRange
);

/**
 * User Activity Logs
 * ADMIN ONLY
 */
router.get(
  '/activities/user/:userId',
  twgold_requireRole(['admin']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldActivities.getUserActivities
);

/* =========================================================
   📊 DASHBOARD ROUTES
========================================================= */

/**
 * Admin / Manager Dashboard Stats
 */
router.get(
  '/dashboard/stats',
  twgold_requireRole(['admin', 'manager']),
  twgold_checkPermission('reporting', 'read'),
  ServiceManager.TWgoldActivities.getDashboardStats
);

module.exports = router;