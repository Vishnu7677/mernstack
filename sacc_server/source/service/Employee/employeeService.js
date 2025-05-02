const bcrypt = require('bcryptjs');
const repository  = require('./employeeRepository');
const {getToken } = require('../../commons/auth/JWTManager/JWTService');



function Service() {}

Service.prototype.createEmployeeService = async (data) => {
  data.employee_password = await bcrypt.hash(data.employee_password, 10);
  return await repository.createEmployee(data);
};



Service.prototype.loginEmployee = async (email, password) => {
  const employee = await repository.findEmployeeByEmail(email);
  if (!employee || !(await bcrypt.compare(password, employee.employee_password))) {
    throw new Error('Invalid email or password');
  }

  const tokenData = getToken({ id: employee._id, role: employee.role });
  return {
    token: tokenData.data.token,
    expiresIn: tokenData.data.expiresIn,
    tokenType: tokenData.data.tokenType
  };
};


Service.prototype.getEmployeeById = async (employeeId) => {
  const employee = await repository.findEmployeeById(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }
  return employee;
};





module.exports = new Service();

