const express = require('express');
const ServiceManager = require('../../service/ServiceManager');
const verifyIndividualJWT = require('../../middleware/IndividualLogin/IndividualAuth');
const { IndividualScholarshipUpload } = require('../../commons/util/fileUpload/upload');

const router = express.Router();

// Public routes
router.post('/signup', ServiceManager.IndividualScholar.createUser);
router.post('/login', ServiceManager.IndividualScholar.loginScholar);

// Protected routes
router.use(verifyIndividualJWT);
router.get('/profile', ServiceManager.IndividualScholar.getProfile);
router.post('/application', ServiceManager.IndividualScholar.createOrUpdateApplication);
router.get('/application/draft', ServiceManager.IndividualScholar.getDraftApplication);
router.put('/application/draft', ServiceManager.IndividualScholar.saveDraftApplication);
router.delete('/application/draft', ServiceManager.IndividualScholar.deleteDraftApplication);
router.put('/application/submit', ServiceManager.IndividualScholar.submitApplication);
router.post('/application/:applicationId/upload', ServiceManager.IndividualScholar.uploadDocuments);

module.exports = router;