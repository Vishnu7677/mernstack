const express = require('express');
const router = express.Router();
const ServiceManager = require('../../service/ServiceManager');
const verifyEmployeeJWT = require ('../../middleware/verifyEmployeeJWT/EmployeeJWT')

router.use(express.json());


router.post('/employeelogin', ServiceManager.Employee.loginEmployee);

router.use(verifyEmployeeJWT);

router.get('/employeeDetails', ServiceManager.Employee.getEmployeeDetails);

router.post('/usersearch',ServiceManager.Users.searchUserDetails);

router.get('/user/:membershipId', ServiceManager.Users.getUserDetailsByMembershipId);


module.exports = router;