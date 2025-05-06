const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  type: { type: String },
  url: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

const MembershipSchema = new mongoose.Schema({
  membership_id: String,
  membership_type: { type: String, enum: ['Ordinary', 'VIP'] },
  membership_opened_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approved_by: { type: mongoose.Schema.Types.ObjectId, refPath: 'approved_by_role' },
  approved_by_role: { type: String, enum: ['Admin', 'Manager'] },
  membership_start_date: { type: Date, default: Date.now },
  membership_status: { type: String, default: 'Pending' },
  isVerified: { type: Boolean, default: false },
  application_fee_received: { type: Number },
  receipt_no: { type: String},
  documents: [DocumentSchema],
  applicants_signature: { type: String },
  marital_status: { type: String, enum: ['Single', 'Married', 'Divorced']},
  annual_income: { type: Number },
  occupation: { type: String},
  name_of_employer_business: { type: String}
});
const AccountSchema = new mongoose.Schema({
  account_id: String,
  account_number: { type: String },
  account_type: { type: String, enum: ['Savings', 'Current'] },
  account_ownership: { type: String, enum: ['Individual', 'Joint', 'Minor'] },
  account_opened_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approved_by: { type: mongoose.Schema.Types.ObjectId, refPath: 'approved_by_role' },
  approved_by_role: { type: String, enum: ['Admin', 'Manager'] },
  account_start_date: { type: Date },
  account_status: String,
  isVerified: { type: Boolean, default: false },
  receipt_no: Number,
  amount_deposited: Number,
  cash_in_account: Number,
  payment_mode: { type: String, enum: ['Cash', 'Cheque', 'NEFT/RTGS', 'UPI'] },
  customer_id: { type: Number },
  customer_password: { type: String }
});
const GuardianSchema = new mongoose.Schema({
  guardians_full_name: String,
  guardians_phone_number: Number,
  guardians_signature: String,
  relationship_with_applicant: String,
});
const AddressSchema = new mongoose.Schema({
  country: String,
  district: String,
  house: String,
  landmark: String,
  pincode: Number,
  post_office: String,
  state: String,
  street: String,
  subdistrict: String,
  vtc: String,
  isSame: { type: Boolean, default: true }
});
const LoanSchema = new mongoose.Schema({
  loan_type: { type: String, enum: ['Personal Loan', 'Gold Loan', 'Home Loan', 'Car Loan'] },
  loan_amount: Number,
  interest_rate: Number,
  loan_duration: Number,
  start_date: Date,
  end_date: Date,
  status: { type: String, enum: ['Active', 'Closed', 'Pending'], default: 'Pending' },
  emi_amount: Number,
  outstanding_balance: Number,
  loan_opened_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  approved_by: { type: mongoose.Schema.Types.ObjectId, refPath: 'approved_by_role' },
  approved_by_role: { type: String, enum: ['Admin', 'Manager'] },
});

const AadhaarVerificationSchema = new mongoose.Schema({
  aadhaar_number: { type: String,immutable: true },
  aadhaar_hash:{type: String, immutable: true},
  name: { type: String },
  care_of: String,
  full_address: String,
  father_name: String,
  mother_name: String,
  date_of_birth: { type: String },
  gender: { type: String, enum: ['M', 'F', 'T'], },
  phone_number: { type: String},
  email_id: String,
  photo: String,
  is_otp_verified: { type: Boolean, default: false },
  permanent_address: { type: AddressSchema},
  current_address: AddressSchema,
  membership: { type: MembershipSchema },
  account: [AccountSchema],
  guardian: [GuardianSchema],
  loans: [LoanSchema],
  pan_number: String,
  year_of_birth:Number,
  authorization_token:String,
  message:String,
  status: String,
  reference_id:String,
  is_minor:Boolean,
  timestamp:Number,
  reference_id:{type: String},
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('UserDetails', AadhaarVerificationSchema, 'UserDetails');
