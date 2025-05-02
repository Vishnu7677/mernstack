require('dotenv').config();
const Employee = require('../../../commons/models/mongo/documents/employeeModel')
const UserDetails =require('../../../commons/models/mongo/documents/UserDetails')


function GeneralUtil() { }

const randomString = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Numeric OTP generation
GeneralUtil.prototype.generateNumericOTP = function () {
  const digits = '0123456789';
  const otpLength = 6; // Change as needed
  let otp = '';

  for (let i = 1; i <= otpLength; i++) {
    const index = Math.floor(Math.random() * (digits.length));
    otp += digits[index];
  }

  return otp;
};

// Email validation
GeneralUtil.prototype.isValidEmail = function (email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Mobile number validation
GeneralUtil.prototype.isValidMobileNumber = function (contact) {
  const re = /^([+]\d{2})?\d{10}$/;
  return re.test(String(contact));
};

// Random alphanumeric string
GeneralUtil.prototype.randomAlphaNumericString = function (length = 6, chars = randomString) {
  let result = '';
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

// 4-digit numeric OTP generation
GeneralUtil.prototype.generateNumericFourDigitOTP = function (otpLength = 4) {
  const digits = '0123456789';
  let otp = '';

  for (let i = 1; i <= otpLength; i++) {
    const index = Math.floor(Math.random() * (digits.length));
    otp += digits[index];
  }

  return otp;
};

// String with numbers validation
GeneralUtil.prototype.isValidStringWithNumbers = function (contact) {
  const re = /^[a-zA-Z0-9]+$/;
  return re.test(String(contact));
};

// Add prefix to mobile number
GeneralUtil.prototype.addPrefixToMobileNumber = function (contact) {
  const re = /^(\+?\d{2})?(\d{10})$/;
  const match = String(contact).match(re);
  if (match) {
    const prefix = match[1] ? match[1] : '+91'; // Add +91 prefix if not present
    return prefix + match[2]; // Concatenate prefix and 10-digit number
  } else {
    return null; // Invalid number
  }
};

// Check for duplicates in an array
GeneralUtil.prototype.hasDuplicates = function (arry) {
  const seen = new Set();
  for (let item of arry) {
    if (seen.has(item)) {
      return true;
    }
    seen.add(item);
  }
  return false;
};

// Generate Membership ID
let membershipCounter = 100000;
GeneralUtil.prototype.generateMembershipId = function () {
  const prefix = 'LNSASS110';
  return `${prefix}${membershipCounter++}`;
};

// Generate Account Number
let accountCounter = 100000;
GeneralUtil.prototype.generateAccountNumber = async function () {
  const prefix = '75254842';
  
  // Find the last account created and sort by account_number in descending order
  const lastAccount = await UserDetails
    .findOne({ 'account.account_number': { $exists: true } })
    .sort({ 'account.account_number': -1 })
    .select('account.account_number')
    .exec();

  let lastCounter = accountCounter; // fallback to the original counter
  
  if (lastAccount && lastAccount.account && lastAccount.account.length > 0) {
    // Extract the numeric part after the prefix
    const lastAccountNumber = lastAccount.account[lastAccount.account.length - 1].account_number;
    const numericPart = lastAccountNumber.replace(prefix, '');
    lastCounter = parseInt(numericPart, 10) + 1;
  }

  return `${prefix}${lastCounter}`;
};
GeneralUtil.prototype.generateEmployeeID = async function () {
  const prefix = 'LNSA';
  const lastEmployee = await Employee.findOne().sort({ employee_id: -1 }).exec(); // Get the last inserted employee
  const lastID = lastEmployee ? parseInt(lastEmployee.employee_id.replace(prefix, '')) : 0;
  const newID = lastID + 1;
  return `${prefix}${String(newID).padStart(4, '0')}`;
};


// Generate Loan Account Number
let loanAccountCounter = 0;
GeneralUtil.prototype.generateLoanAccountNumber = function () {
  const prefix = '7767261';
  return `${prefix}${String(loanAccountCounter++).padStart(6, '0')}`;
};

module.exports = new GeneralUtil();
