// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const ServiceManager = require('../../service/ServiceManager');


// body: { files: [{ name: "photo1.jpg", type: "image/jpeg" }, ...] }
router.post('/presign', ServiceManager.uploadController.generatePresignedUrls);

module.exports = router;
