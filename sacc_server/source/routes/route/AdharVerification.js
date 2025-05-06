const express = require('express');
const router = express.Router();
const ServiceManager = require('../../service/ServiceManager');

router.use(express.json());

router.post('/aadharsendingotp', ServiceManager.AadharVerification.generateOtp);
router.post('/aadharverifyingotp', ServiceManager.AadharVerification.verifyOtp);
router.post('/aadharotpsending',ServiceManager.IndividualAadhar.generatescholarOtp);
router.post('/aadharotpverifying',ServiceManager.IndividualAadhar.verifyScholarOtp);






module.exports = router;