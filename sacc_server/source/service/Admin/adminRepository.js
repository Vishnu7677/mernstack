const Admin = require('../../commons/models/mongo/documents/adminModel');
const User = require('../../commons/models/mongo/documents/UserDetails')

function Repository() {}

Repository.prototype.createAdmin = async (data) => await Admin.create(data);
Repository.prototype.findAdminByEmail = async (admin_email) => await Admin.findOne({ admin_email });


Repository.prototype.findAdminById = async (AdminId) => {
  return await Admin.findById(AdminId);
};


Repository.prototype.updateAdmin = async (id, data) => await Admin.findByIdAndUpdate(id, data, { new: true });

Repository.prototype.deleteAdmin = async (id) => await Admin.findByIdAndDelete(id);

// Update user details based on _id or phone
Repository.prototype.updateUserDetails = async (identifier, update) => {
  const query = identifier._id ? { _id: identifier._id } : { phone: identifier.phone };
  
  console.log('Executing update with:', {
    query,
    update,
    options: { new: true, useFindAndModify: false }
  });

  const result = await User.findOneAndUpdate(
    query,
    update,
    { 
      new: true,
      useFindAndModify: false
    }
  );

  return result;
};
  
  Repository.prototype.findUserByIdOrPhone = async (identifier) => {
    const query = identifier._id ? { _id: identifier._id } : { phone: identifier.phone };
    return await User.findOne(query);
  };
  

module.exports = new Repository();
