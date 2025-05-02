const { UserDetails } = require('../../commons/models/mongo/mongodb');
const GeneralUtil = require('../../commons/util/general/utility');


function Repository() {}

Repository.prototype.findAll = async () => {
  return await UserDetails.find({ 
    'membership.isVerified': false,
    isDeleted: false 
  }, { __v: 0 }).lean();
};

Repository.prototype.findAllUsers = async () => {
  return await UserDetails.find({ 
    'membership.isVerified': true,
    isDeleted: false 
  }, { __v: 0 }).lean();
};


Repository.prototype.findById = async (userId) => {
    return await UserDetails.findById(userId, { __v: 0 }).lean();
};

// Utility function to check if a string is a valid JSON
Repository.prototype.createOrUpdate = async (data) => {
  try {
    if (!data.aadhaar_number) {
      throw new Error('Encrypted Aadhaar number is required');
    }
    
    // Check if user exists by encrypted Aadhaar number
    const existingUser = await UserDetails.findOne({ aadhaar_number: data.aadhaar_number });

    if (existingUser) {
      // Update existing user
      const updatedUser = await UserDetails.findOneAndUpdate(
        { aadhaar_number: data.aadhaar_number },
        { $set: data },
        { 
          new: true, 
          upsert: false,
          runValidators: true 
        }
      );
      
      if (!updatedUser) {
        throw new Error('User update failed');
      }
      
      return { isNew: false, user: updatedUser };
    } else {
      // Create new user
      const newUser = await UserDetails.create(data);
      return { isNew: true, user: newUser };
    }
  } catch (error) {
    console.error('Repository Error:', error);
    throw error;
  }
};

Repository.prototype.getAll = async function (modelName) {
  // Dynamically resolve the model and fetch all records
  const model = modelName === "UserDetails" ? UserDetails : null;
  if (!model) throw new Error("Invalid model name provided.");

  const data = await model.find({});
  return data;
};





Repository.prototype.updateById = async (userId, updateData) => {
    return await UserDetails.findByIdAndUpdate(userId, updateData, { new: true }).lean();
  }

Repository.prototype.deleteById = async (userId) => {
    return await UserDetails.findByIdAndDelete(userId).lean();
  }

  Repository.prototype.findUserByMembershipId = async (membershipId) => {
    try {
      const user = await UserDetails.findOne({ 'membership.membership_id': membershipId }, { __v: 0 }).lean();
      return user || null; // Ensure null is explicitly returned if no user found
    } catch (error) {
      console.error(`Database error finding user with Membership ID ${membershipId}:`, error.message);
      throw error; // Let the caller handle the error
    }
  };

  Repository.prototype.createAccount = async (accountData) => {
    // Generate account details - ensure these are awaited if they're async
    const accountNumber = await GeneralUtil.generateAccountNumber(); // Make sure this is awaited
    const customerId = `752${String(await UserDetails.countDocuments() + 1).padStart(6, '0')}`;
    const customerPassword = `LNSAA${GeneralUtil.randomAlphaNumericString(7)}`;
    
    const newAccount = {
      account_number: accountNumber, // Now this will be a string, not a Promise
      account_type: accountData.accountType,
      account_ownership: accountData.accountOwnership || 'Individual',
      account_opened_by: accountData.employeeId,
      account_start_date: new Date(),
      account_status: 'Active',
      isVerified: true,
      amount_deposited: accountData.depositAmount,
      cash_in_account: accountData.depositAmount,
      payment_mode: accountData.paymentMode || 'Cash',
      customer_id: customerId,
      customer_password: customerPassword
    };
  
    return await UserDetails.findOneAndUpdate(
      { 'membership.membership_id': accountData.membershipId },
      { $push: { account: newAccount } },
      { new: true }
    );
};


module.exports = new Repository();
