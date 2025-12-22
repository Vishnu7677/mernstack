const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getNextSequence } = require('./TWGoldcommonschema');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Do not return password by default in queries
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // --- Identity ---
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true
  },
  profileImage: String, // URL to avatar (lightweight)

  // --- Organization Role ---
  role: {
    type: String,
    enum: [
      'admin', 'manager', 'asst_manager', 'cashier', 'accountant', 
      'recovery_agent', 'grivirence', 'auditor', 'hr', 
      'administration', 'sales_marketing', 'rm', 'zm', 'employee','go_auditor'
    ],
    required: true
  },
  department: { type: String, index: true },
  // User schema
branch: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'TWGoldBranch',
  index: true
},
  designation: String,

  // --- Hierarchy ---
  reportsTo: { type: mongoose.Schema.Types.ObjectId, ref: 'TWgoldUser' },

  // --- Permissions (RBAC) ---
  // Kept in User Schema for fast middleware checking
  permissions: [{
    module: {
      type: String,
      enum: [
        'gold_management', 'loan_management', 'customer_management', 
        'employee_management', 'finance', 'inventory', 'reporting', 
        'system_admin'
      ]
    },
    access: {
      type: String,
      enum: ['read', 'write', 'approve', 'delete', 'manage'],
      default: 'read'
    },
    scope: {
      type: String,
      enum: ['self', 'branch', 'region', 'all'],
      default: 'self'
    }
  }],
  lastLogin:  Date,
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

userSchema.index({ branch: 1, role: 1 });
userSchema.index({ branch: 1, isActive: 1 });


// ================== VIRTUALS ==================
// This allows you to do populate('employmentProfile') even though the ID is in the other file
userSchema.virtual('TWGoldemploymentProfile', {
  ref: 'TWGoldEmploymentProfile',
  localField: '_id',
  foreignField: 'TWgoldUser',
  justOne: true
});


// ================== MIDDLEWARE ==================
userSchema.pre('save', async function(next) {
  try {
    // 1. Generate Employee ID if new
    if (!this.employeeId && this.isNew) {

      const ROLE_PREFIX = {
        admin: 'ADM',
        manager: 'MGR',
        asst_manager: 'AMG',
        cashier: 'CAS',
        accountant: 'ACC',
        recovery_agent: 'REC',
        grivirence: 'GRV',
        auditor: 'AUD',
        hr: 'HR',
        administration: 'ADN',
        sales_marketing: 'SAL',
        rm: 'RM',
        zm: 'ZM',
        employee: 'EMP'
      };

      const prefix = ROLE_PREFIX[this.role] || 'EMP';
      const FIXED_CODE = '2805';

      const counterKey = `${prefix}-${FIXED_CODE}`;

      const seq = await getNextSequence(counterKey);

      const sequence = String(seq).padStart(4, '0');

      this.employeeId = `${prefix}${FIXED_CODE}${sequence}`;
    }

    // 2. Set Default Permissions if empty
    if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
      this.permissions = this.getDefaultPermissions();
    }

    // 3. Hash Password if modified
     if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// ================== METHODS ==================
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.hasPermission = function(module, access = 'read') {
  if (this.role === 'admin') return true;
  return this.permissions.some(perm => 
    perm.module === module && 
    (perm.access === access || perm.access === 'manage') // 'manage' implies all access
  );
};

userSchema.methods.getDefaultPermissions = function() {
  const roleMap = {
    admin: [{ module: 'system_admin', access: 'manage', scope: 'all' }],
    manager: [{ module: 'loan_management', access: 'approve', scope: 'branch' }],
    hr: [{ module: 'employee_management', access: 'manage', scope: 'branch' }],
    // Add other defaults as needed
    default: [{ module: 'customer_management', access: 'read', scope: 'self' }]
  };
  return roleMap[this.role] || roleMap['default'];
};

// ================== STATICS ==================
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true }).select('-password');
};

userSchema.statics.findByBranch = function(branch) {
  return this.find({ branch, isActive: true }).select('name email role designation');
};

userSchema.methods.updateLastLogin = async function() {
  try {
    // efficient update that bypasses hooks and full validation
    await this.model('TWgoldUser').updateOne(
      { _id: this._id },
      { $set: { lastLogin: new Date() } }
    );
  } catch (error) {
    // Log the ACTUAL error so you can see it in the console
    console.error('Update Last Login Failed:', error);
    // Do not throw; failing to update a timestamp shouldn't block the login
  }
};

module.exports = mongoose.model('TWgoldUser', userSchema);