const express = require('express');
const ServiceManager = require('../../service/ServiceManager');
const { validateSignup, validateLogin } = require('../../middleware/validation');

const router = express.Router();

router.use(express.json());


router.post('/signup', validateSignup, ServiceManager.CareerLogin.signup);
router.post('/login', validateLogin, ServiceManager.CareerLogin.login);

module.exports = router;