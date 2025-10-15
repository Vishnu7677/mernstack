const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  locations: [{
    type: String,
    required: true,
    enum: [
      'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 
      'Rajahmundry', 'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur',
      'Eluru', 'Ongole', 'Chittoor', 'Hindupur', 'Machilipatnam'
    ]
  }],
  salaryRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  employmentType: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  benefits: [String],
  postedDate: {
    type: Date,
    default: Date.now
  },
  applicationDeadline: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('CareerJob', jobSchema, 'CareerJob');