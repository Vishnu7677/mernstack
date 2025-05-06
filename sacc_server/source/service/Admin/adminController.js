const service  = require('./adminService');
const repository = require('./adminRepository')


function Controller() {}

Controller.prototype.createAdmin = async (req, res) => {
  try {
    if (!req.body.admin_password) {
      throw new Error("Password is required");
    }
    const result = await service.createAdminService(req.body);
    res.status(201).json({ message: 'Admin created', result });
  } catch (error) {
    console.error(error); // Debugging
    res.status(400).json({ message: error.message });
  }
};

Controller.prototype.loginAdmin = async (req, res) => {
  try {
    const token = await service.loginAdminService(req.body.adminEmail, req.body.adminPassword);
    res.status(200).json({
      data: {
        message: "Admin Login successful",
        status: 200,
        token: token.token,
        expiresIn: token.expiresIn,
        tokenType: token.tokenType
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


Controller.prototype.updateUserDetails = async (req, res) => {
  try {
    const { _id, phone, action } = req.body;
    const approverId = req.user.id;
    const approverRole = req.user.role; // 'Admin' or 'Manager'
    
    // Initialize updateData here
    const updateData = {
      approved_by: approverId,
      approved_by_role: approverRole
    };
    
    // Ensure 'action' is valid
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: "'action' must be either 'accept' or 'reject'" });
    }

    // Handle case when both _id and phone are provided
    if (_id && phone) {
      const user = await repository.findUserByIdAndPhone(_id, phone);
      if (!user) {
        return res.status(404).json({ message: "User with matching '_id' and 'phone' not found" });
      }
    } else if (!_id && !phone) {
      return res.status(400).json({ message: "Either '_id' or 'phone' must be provided" });
    }

    const identifier = _id ? { _id } : { phone };
    const result = await service.updateUserDetailsService(identifier, action, updateData);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User details updated successfully', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


Controller.prototype.getAdminDetails = async (req, res) => {
  try {
    // Extract the employee ID from the decoded JWT (set by the middleware)
    const AdminId = req.user.id;
    
    // Fetch the employee data using the ID from the database
    const Admin = await service.getAdminById(AdminId);
    if (!Admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      data: {
        message: 'Admin details retrieved successfully',
        status: 200,
        data: Admin, 
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message  });
  }
};




module.exports = new Controller();

