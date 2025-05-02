const express = require('express');
const router = express.Router();
const ServiceManager = require('../../service/ServiceManager');
const {schoolLicenseUpload} = require('../../commons/util/fileUpload/upload');


router.use(express.json());

// Add this before your multer middleware
router.post('/signup/school', 
  schoolLicenseUpload,
  ServiceManager.SchoolScholar.schoolSignup
);
  
  router.post(
    '/verify/school-otp',
    ServiceManager.SchoolScholar.verifySchoolOtp
  );

router.post('/submit', ServiceManager.SchoolScholar.submitApplication);
router.get('/getapplications', ServiceManager.SchoolScholar.getApplications);
router.get('/getapplication/:id', ServiceManager.SchoolScholar.getApplication);
router.put('/updateapplication/:id', ServiceManager.SchoolScholar.updateApplication);
router.delete('/deleteapplication/:id', ServiceManager.SchoolScholar.deleteApplication);

module.exports = router;