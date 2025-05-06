const express = require('express');
const router = express.Router();
const ServiceManager = require('../../service/ServiceManager');
const {  membershipDocumentUpload } = require('../../commons/util/fileUpload/upload');
const verifyEmployeeJWT = require ('../../middleware/verifyEmployeeJWT/EmployeeJWT')
router.use(express.json());


router.get('/getallusers', ServiceManager.Users.getAllUserDetails);
router.get('/getuserbyid/:userId', ServiceManager.Users.getUserDetailsById);
router.post('/createuser',verifyEmployeeJWT,membershipDocumentUpload, ServiceManager.Users.createOrUpdateUser);
router.post('/createaccount', verifyEmployeeJWT, ServiceManager.Users.openAccount);
router.put('/edituser/:userId', ServiceManager.Users.editUser);
router.delete('/deleteuser/:userId', ServiceManager.Users.deleteUser);



module.exports = router;