const bcrypt = require('bcryptjs');
const repository  = require('./adminRepository');
const {getToken } = require('../../commons/auth/JWTManager/JWTService');
const GeneralUtil = require('../../commons/util/general/utility');

// Admin service

function Service() {}

Service.prototype.createAdminService = async (data) => {
  if (!data.admin_password) {
    throw new Error("Password is required");
  }
  data.admin_password = await bcrypt.hash(data.admin_password, 10);
  return await repository.createAdmin(data);
};


Service.prototype.loginAdminService = async (admin_email, admin_password) => {
  const admin = await repository.findAdminByEmail(admin_email);
  if (!admin || !(await bcrypt.compare(admin_password, admin.admin_password))) {
    throw new Error('Invalid email or password');
  }

  const tokenData = getToken({ id: admin._id, role: admin.role });
  return {
    token: tokenData.data.token,
    expiresIn: tokenData.data.expiresIn,
    tokenType: tokenData.data.tokenType
  };
};


Service.prototype.getAdminById = async (AdminId) => {
  const Admin = await repository.findAdminById(AdminId);
  if (!Admin) {
    throw new Error('Admin not found');
  }
  return Admin;
};


Service.prototype.updateUserDetailsService = async (identifier, action, updateData) => {
  const user = await repository.findUserByIdOrPhone(identifier);
  
  if (!user) {
    return null;
  }

  // Prepare the base update
  const update = {
    approved_by: updateData.approved_by,
    approved_by_role: updateData.approved_by_role
  };

  // Add membership updates directly with dot notation
  if (action === 'accept') {
    update['membership.membership_status'] = 'accepted';
    update['membership.isVerified'] = true;
    update['membership.membership_start_date'] = new Date();
    update['membership.membership_id'] = GeneralUtil.generateMembershipId();
  } else if (action === 'reject') {
    update['membership.membership_status'] = 'rejected';
    update['membership.isVerified'] = false;
  }

  // Convert to proper $set syntax
  const finalUpdate = { $set: update };

  
  return await repository.updateUserDetails(identifier, finalUpdate);
};



module.exports = new Service();

