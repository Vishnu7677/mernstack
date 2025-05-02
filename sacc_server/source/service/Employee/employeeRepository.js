const Employee = require('../../commons/models/mongo/documents/employeeModel');

function Repository() {}

Repository.prototype.createEmployee = async (data) => {
    const existingEmployee = await Employee.findOne({ employee_email: data.employee_email });
    if (existingEmployee) {
      throw new Error('Employee with this email already exists.');
    }
    return await Employee.create(data); 
  };

Repository.prototype.findEmployeeByEmail = async (employee_email) => await Employee.findOne({ employee_email });


Repository.prototype.findEmployeeById = async (employeeId) => {
  return await Employee.findById(employeeId);
};



Repository.prototype.updateEmployee = async (id, data) => await Employee.findByIdAndUpdate(id, data, { new: true });


Repository.prototype.deleteEmployee = async (id) => await Employee.findByIdAndDelete(id);


module.exports = new Repository();
