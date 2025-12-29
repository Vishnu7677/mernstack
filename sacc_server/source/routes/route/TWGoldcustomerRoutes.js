const express = require('express');
const router = express.Router();
const ServiceManager = require('../../service/ServiceManager');
const {
  twgold_authMiddleware,
  twgold_requireRole,
  twgold_checkPermission
} = require('../../middleware/TwGold/TWGoldauthMiddleware');

/* 🔐 AUTH */
router.use(twgold_authMiddleware);

/**
 * 🔍 Get Customer by Customer ID
 * CLERK / MANAGER
 */
router.get(
  '/customers/by-customer-id/:customerId',
  twgold_requireRole(['employee', 'manager']),
  twgold_checkPermission('customer_management', 'read'),
  ServiceManager.TWgoldCustomers.getCustomerByCustomerId
);

module.exports = router;
