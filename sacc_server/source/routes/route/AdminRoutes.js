const express = require('express');
const router = express.Router();
const ServiceManager = require('../../service/ServiceManager');
const verifyAdminJWT = require('../../middleware/adminAuthMiddleware/adminAuthMiddleware');


router.use(express.json());

router.post('/createadmin', ServiceManager.Admin.createAdmin);
router.post('/adminlogin', ServiceManager.Admin.loginAdmin);

router.use(verifyAdminJWT);

router.get('/getadmindetails',ServiceManager.Admin.getAdminDetails)


// Employee Routes
router.post(
    '/createemployee',  
    ServiceManager.Employee.createEmployee
  );
  

// User Routes

router.post('/membershipupdate', ServiceManager.Admin.updateUserDetails)
router.get('/verifieduser', ServiceManager.Users.getverifiedUserDetails);


module.exports = router;