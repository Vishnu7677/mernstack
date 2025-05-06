const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY', 
  'AWS_REGION',
  'AWS_BUCKET_NAME'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Improved S3 Storage configuration with validation
const s3Storage = (folder) => {
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error('AWS_BUCKET_NAME is not defined in environment variables');
  }

  return multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${folder}/${file.fieldname}-${Date.now()}${ext}`;
      cb(null, filename);
    }
  });
};

// Common file filter for all uploads
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png'];
  const allowedDocTypes = ['application/pdf', 'image/jpeg', 'image/png'];

  // Signature files validation
  if (file.fieldname.includes('Signature')) {
    if (allowedImageTypes.includes(file.mimetype) && file.size <= 100 * 1024) {
      return cb(null, true);
    }
    return cb(new Error('Signature must be JPG/PNG under 100KB'), false);
  }

  // Photo validation
  if (file.fieldname === 'photograph') {
    if (allowedImageTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Photo must be JPG/PNG'), false);
  }

  // Document validation (common for both scholarship and school)
  if ([
    'aadharCard',
    'marksheet',
    'incomeCertificate',
    'bonafideCertificate',
    'bankPassbook',
    'paymentReceipt',
    'licencePhoto',
    'principalSignature'
  ].includes(file.fieldname)) {
    if (allowedImageTypes.includes(file.mimetype) || allowedDocTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Document must be JPG, PNG, or PDF'), false);
  }

  cb(new Error('Unsupported file type or fieldname'), false);
};

// School License Upload Middleware
const schoolLicenseUpload = multer({
  storage: s3Storage('school-licenses'),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'licencePhoto' && 
        ['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Only JPG/PNG license photos are allowed'), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
}).single('licencePhoto');

// Scholarship Application Upload Middleware
const scholarshipApplicationUpload = multer({
  storage: s3Storage('scholarship-documents'),
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB
}).fields([
  { name: 'aadharCard', maxCount: 1 },
  { name: 'marksheet', maxCount: 1 },
  { name: 'incomeCertificate', maxCount: 1 },
  { name: 'bonafideCertificate', maxCount: 1 },
  { name: 'bankPassbook', maxCount: 1 },
  { name: 'photograph', maxCount: 1 },
  { name: 'applicantSignature', maxCount: 1 },
  { name: 'parentSignature', maxCount: 1 },
  { name: 'paymentReceipt', maxCount: 1 }
]);

// Individual uploaders for specific use cases
const uploadSignaturesOnly = multer({
  storage: s3Storage('signatures'),
  fileFilter: (req, file, cb) => {
    if (file.fieldname.includes('Signature')) {
      if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
        return cb(null, true);
      }
    }
    cb(new Error('Only signature images (JPG/PNG) are allowed'), false);
  },
  limits: { fileSize: 100 * 1024 } // 100KB
}).fields([
  { name: 'applicantSignature', maxCount: 1 },
  { name: 'parentSignature', maxCount: 1 },
  { name: 'principalSignature', maxCount: 1 }
]);

const uploadPhotoOnly = multer({
  storage: s3Storage('photos'),
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Only JPG/PNG images are allowed'), false);
  },
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB
}).single('photograph');

// In upload.js, add a new uploader for membership documents
const membershipDocumentUpload = multer({
  storage: s3Storage('membership-documents'),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, or PDF files are allowed'), false);
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      return cb(new Error('File size must be less than 2MB'), false);
    }
    
    cb(null, true);
  }
}).fields([
  { name: 'aadhaar_front', maxCount: 1 },
  { name: 'aadhaar_back', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'birth_certificate', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]);

const uploadEmployeePhoto = multer({
  storage: s3Storage('employee-photos'),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Employee photo must be JPG or PNG'), false);
  },
  limits: { 
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
}).single('employee_photo');



module.exports = {
  schoolLicenseUpload,
  scholarshipApplicationUpload,
  uploadSignaturesOnly,
  uploadPhotoOnly,
  membershipDocumentUpload,
   uploadEmployeePhoto

};
