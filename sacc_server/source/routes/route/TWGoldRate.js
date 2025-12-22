// routes/route/TWGoldRate.js
const express = require('express');
const router = express.Router();
const ServiceManager = require('../../service/ServiceManager');
const {
  twgold_authMiddleware,
  twgold_requireRole,
  twgold_checkPermission,
} = require('../../middleware/TwGold/TWGoldauthMiddleware');

/* =========================================================
   🔐 AUTH MIDDLEWARE (APPLIED TO ALL ROUTES BELOW)
========================================================= */
router.use(twgold_authMiddleware);



router.post(
    '/gold-rates',
    twgold_requireRole(['admin']),
    twgold_checkPermission('system_admin', 'manage'),
    ServiceManager.TWgoldGoldRates.updateDailyRates
  );

  router.get(
    '/gold-rates/current',
    ServiceManager.TWgoldGoldRates.getCurrentRates
  );

  router.get(
    '/gold-rates/history',
    ServiceManager.TWgoldGoldRates.getRateHistory
  );

  
  
module.exports = router;