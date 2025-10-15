const express = require('express');
const ServiceManager = require('../../service/ServiceManager');
const router = express.Router();

router.use(express.json());

router.get('/', ServiceManager.CareerJobs.getAllJobs);
router.get('/search', ServiceManager.CareerJobs.searchJobs);
router.get('/:id', ServiceManager.CareerJobs.getJob);

module.exports = router;