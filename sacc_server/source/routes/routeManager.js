/**
 * ROUTE MANAGER
 *
 * > purpose
 *   + to take routing load from app.js and manage all routes within application
 *
 */

const express = require('express');
const router = express.Router();


const aadhaarOtp = require('./route/AdharVerification');
const Admin = require('./route/AdminRoutes')
const Users = require('./route/UserRoutes')
const Employee = require('./route/employeeRoutes');
const Scholar = require('./route/SchoolScholar')
const Individual = require('./route/IndividualScholar') 


// routes
 router.use('/api/aadharOtp', aadhaarOtp);
 router.use('/api/admin', Admin);
 router.use('/api/user', Users);
router.use('/api/employee',Employee);
router.use('/api/scholar', Scholar);
router.use('/api/scholar/individual', Individual);






 module.exports = router;
