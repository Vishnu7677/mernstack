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
router.post('/applications', ServiceManager.IndividualScholar.createOrUpdateApplication);
router.put('/applications/:applicationId', ServiceManager.IndividualScholar.createOrUpdateApplication);
router.get('/applications/all',  ServiceManager.IndividualScholar.getAllApplications);
router.get('/application/draft', ServiceManager.IndividualScholar.getDraftApplications);
router.put('/applications/:applicationId/draft', ServiceManager.IndividualScholar.saveDraftApplication);
router.delete('/applications/:applicationId', ServiceManager.IndividualScholar.deleteDraftApplication);
router.put('/application/:applicationId/submit', ServiceManager.IndividualScholar.submitApplication);
router.post('/application/:applicationId/upload', ServiceManager.IndividualScholar.uploadDocuments);

module.exports = router;