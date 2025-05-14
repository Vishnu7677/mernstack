const express = require('express');
const router = express.Router();
const ServiceManager = require('../../service/ServiceManager');
const verifyAdminJWT = require('../../middleware/adminAuthMiddleware/adminAuthMiddleware');
const { uploadEmployeePhoto,uploadAdminPhoto } = require('../../commons/util/fileUpload/upload')


router.use(express.json());

router.post('/createadmin',
  (req, res, next) => {
    // First handle the file upload
    uploadAdminPhoto(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message });
      }
      // If upload succeeds, proceed to the controller
      next();
    });
  }, ServiceManager.Admin.createAdmin);
  
router.post('/adminlogin', ServiceManager.Admin.loginAdmin);

router.use(verifyAdminJWT);

router.get('/getadmindetails',ServiceManager.Admin.getAdminDetails)


// Employee Routes
router.post(
  '/createemployee',  
  (req, res, next) => {
    // First handle the file upload
    uploadEmployeePhoto(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message });
      }
      // If upload succeeds, proceed to the controller
      next();
    });
  },
  ServiceManager.Employee.createEmployee
);

// User Routes

router.post('/membershipupdate', ServiceManager.Admin.updateUserDetails)
router.get('/verifieduser', ServiceManager.Users.getverifiedUserDetails);


module.exports = router;
