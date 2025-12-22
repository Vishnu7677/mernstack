const mongoose = require('mongoose');

// --- Centralized Sequence Counter for IDs (Atomic) ---
const sequenceSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'customer_id', 'loan_id'
    seq: { type: Number, default: 0 }
  });
  
  const Sequence = mongoose.model('TWGoldSequence', sequenceSchema);
  
  const getNextSequence = async (key) => {
    const ret = await Sequence.findOneAndUpdate(
      { key: key },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return ret.seq;
  };

// --- Address Schema ---
const AddressSchema = new mongoose.Schema({
    fullAddress: String,
  house: String,
  street: String,
  landmark: String,
  vtc: String, // Village/Town/City
  post_office: String,
  district: String,
  subdistrict: String,
  state: String,
  country: { type: String, default: 'India' },
  pincode: Number,
  isSameAsCurrent: { type: Boolean, default: true }
}, { _id: false });

// --- Education Schema ---
const EducationSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['10th', '12th', 'Diploma', 'Degree', 'Post Graduation', 'Phd'],
    required: true
  },
  institution: String,
  boardOrUniversity: String,
  yearOfPassing: Number,
  percentageOrGrade: String,
  specialization: String
}, { _id: false });

// --- Experience Schema ---
const ExperienceSchema = new mongoose.Schema({
  companyName: String,
  designation: String,
  fromDate: Date,
  toDate: Date,
  isCurrent: { type: Boolean, default: false },
  lastCTC: Number,
  reasonForLeaving: String
}, { _id: false });

module.exports = { getNextSequence,AddressSchema, EducationSchema, ExperienceSchema };
