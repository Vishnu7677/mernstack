const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employee_name:{type:String,required: true},
  employee_phone: {type:Number,required: true},
  employee_photo: {type:String,required: true},
  designation:{type:String,required: true},
  employee_id: {type:String,required: true},
  employee_email: { type: String, required: true, unique: true, sparse: true },
  approved_by:{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  employee_password: { type: String, required: true },
  role: { type: String, default: 'Employee' },
  isVerified: { type: Boolean, default: true},
  isDeleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Employee', employeeSchema, 'Employee');
