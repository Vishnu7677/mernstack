const express = require('express');
const router = express.Router();
const { 
  twgold_authMiddleware, 
  twgold_requireRole 
} = require('../../middleware/TwGold/TWGoldauthMiddleware');

// Branch Routes
router.post('/branches/create', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin']), 
  require('../controllers/branchController').createBranch
);

router.get('/branches', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin', 'manager']), 
  require('../controllers/branchController').getAllBranches
);

router.get('/branches/:id', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin', 'manager']), 
  require('../controllers/branchController').getBranchById
);

router.put('/branches/:id', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin']), 
  require('../controllers/branchController').updateBranch
);

router.get('/branches/performance', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin', 'manager']), 
  require('../controllers/branchController').getBranchPerformance
);

router.post('/branches/:branchId/employees/:employeeId', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin', 'manager']), 
  require('../controllers/branchController').addEmployeeToBranch
);

// Activity Log Routes
router.get('/activities/recent', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin', 'manager']), 
  require('../controllers/activityController').getRecentActivities
);

router.get('/activities/range', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin']), 
  require('../controllers/activityController').getActivitiesByDateRange
);

router.get('/activities/user/:userId', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin']), 
  require('../controllers/activityController').getUserActivities
);

// Dashboard Routes
router.get('/dashboard/stats', 
  twgold_authMiddleware, 
  twgold_requireRole(['admin', 'manager']), 
  require('../controllers/dashboardController').getDashboardStats
);

module.exports = router;