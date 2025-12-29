const Customer = require('../../commons/models/mongo/documents/TWGoldCustomer');

function CustomerController() {}

/**
 * 🔍 Get Customer by Customer ID (CRN)
 * Used in Loan Creation, Customer Search
 */
CustomerController.prototype.getCustomerByCustomerId = async function (req, res) {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    const customer = await Customer.findOne({ customerId })
      .select({
        customerId: 1,
        name: 1,
        phone: 1,
        email: 1,
        panNumber: 1,
        status: 1,
        isKycVerified: 1,
        isAadhaarVerified: 1,
        primaryBranch: 1,
        aadhaarDetails: {
          aadhaar_number: 1,
          name_on_aadhaar: 1,
          gender: 1,
          dob: 1,
          full_address: 1,
          is_otp_verified: 1
        },
        documents: 1,
        createdAt: 1
      })
      .populate('primaryBranch', 'branchName branchCode');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = new CustomerController();
