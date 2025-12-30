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
   💰 LOAN MANAGEMENT ROUTES
========================================================= */

/**
 * Create Gold Loan
 * CLERK ONLY
 */
router.post(
  '/loans',
  ServiceManager.TWgoldLoans.createLoan
);

/**
 * Get My Loans (Created by Clerk)
 * CLERK ONLY
 */
router.get(
  '/loans/my',
  twgold_requireRole(['employee']),
  twgold_checkPermission('loan_management', 'read'),
  ServiceManager.TWgoldLoans.getMyLoans
);

/**
 * Loan Preview / EMI Calculation
 * CLERK
 */
router.post(
  '/loans/calculate',
  ServiceManager.TWgoldLoans.calculateLoan
);

/**
 * Collect EMI
 * CLERK
 */
router.post(
  '/loans/collect-emi',
  twgold_requireRole(['employee']),
  twgold_checkPermission('loan_management', 'write'),
  twgold_checkScope('branch'),
  ServiceManager.TWgoldLoans.collectEMI
);

/* =========================================================
   🧾 MANAGER APPROVAL ROUTES (OPTIONAL / FUTURE READY)
========================================================= */

/**
 * Get Loans Pending Approval
 * MANAGER
 */
router.get(
  '/loans/pending-approval',
  twgold_requireRole(['manager','rm','zm','admin']),
  twgold_checkPermission('loan_management', 'read'),
  ServiceManager.TWgoldLoans.getPendingLoans
);


/**
 * Approve / Reject Loan
 * MANAGER
 */
router.post(
  '/loans/:loanId/decision',
  twgold_requireRole(['manager','rm','zm','admin']),
  twgold_checkPermission('loan_management', 'write'),
  twgold_checkScope('branch'),
  ServiceManager.TWgoldLoans.approveOrRejectLoan // optional, if implemented
);

module.exports = router;
