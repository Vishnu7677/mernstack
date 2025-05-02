const mongoose = require('mongoose');

const subAdminSchema = new mongoose.Schema({
  manager_name:{type:String,required: true},
  manager_phone: {type:Number,required: true},
  manager_photo: {type:String,required: true},
  designation:{type:String,required: true},
  manager_id: {type:String,required: true},
  manager_email: { type: String, required: true, unique: true, sparse: true },
  approved_by:{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  manager_password: { type: String, required: true },
  role: { type: String, default: 'Manager' },
  isVerified: { type: Boolean, default: true},
  isDeleted: {type: Boolean, default: false}
});

module.exports = mongoose.model('Manager', subAdminSchema, 'Manager');
