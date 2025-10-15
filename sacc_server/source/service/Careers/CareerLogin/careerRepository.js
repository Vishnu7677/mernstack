const User = require('../../../commons/models/mongo/documents/CareersUser');

function Repository() {}

Repository.prototype.createUser = async (userData) => {
    return await User.create(userData);
  };

Repository.prototype.findUserByEmail = async (email) => {
    return await User.findOne({ email });
  };

Repository.prototype.findUserById = async (id) => {
    return await User.findById(id);
  };

Repository.prototype.findUserByGoogleId = async (googleId) => {
    return await User.findOne({ googleId });
  };

Repository.prototype.updateUser = async (id, updateData) => {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  };


module.exports = new Repository();