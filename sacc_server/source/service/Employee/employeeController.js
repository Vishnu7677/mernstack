const service  = require('./employeeService');
const GeneralUtil = require('../../commons/util/general/utility');
const { uploadEmployeePhoto } = require('../../commons/util/fileUpload/upload')


function Controller() {}

Controller.prototype.createEmployee = async (req, res) => {
  // Upload employee photo
  uploadEmployeePhoto(req, res, async (err) => {
    if (err) {
      console.error('Employee photo upload error:', err.message);
      return res.status(400).json({ message: err.message });
    }

    try {
      const employeeData = req.body;
      const AdminId = req.user.id.toString(); 

      if (!req.file || !req.file.location) {
        throw new Error('Employee photo upload failed or is missing.');
      }

      // Get S3 URL of uploaded employee photo
      employeeData.employee_photo = req.file.location;

      // Validate and assign email
      if (!employeeData.employee_email || employeeData.employee_email.trim() === '') {
        throw new Error('Employee email is required.');
      }

      // Validate email format
      const emailRegex = GeneralUtil.isValidEmail(employeeData.employee_email);
      if (!emailRegex) {
        throw new Error('Invalid email format.');
      }


      // Generate Employee ID
      employeeData.employee_id = await GeneralUtil.generateEmployeeID();
      employeeData.approved_by = AdminId;

      // Call the service to create the employee
      const result = await service.createEmployeeService(employeeData);
      res.status(201).json({ message: 'Employee created successfully', result });
    } catch (error) {
      console.error('Error creating employee:', error.message);
      res.status(400).json({ message: error.message });
    }
  });
};






Controller.prototype.loginEmployee = async (req, res) => {
  try {
    const token = await service.loginEmployee(req.body.email, req.body.password);
    res.status(200).json({
      data: {
        message: "Employee Login successful",
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


Controller.prototype.getEmployeeDetails = async (req, res) => {
  try {
    // Extract the employee ID from the decoded JWT (set by the middleware)
    const employeeId = req.user.id;
    
    // Fetch the employee data using the ID from the database
    const employee = await service.getEmployeeById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Respond with all fields of the employee object
    res.status(200).json({
      data: {
        message: 'Employee details retrieved successfully',
        status: 200,
        data: employee, // Include the complete employee object
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = new Controller();

