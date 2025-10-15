const service = require('./careerService');

function Controller() {}

Controller.prototype.signup = async (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;

      // Validation
      if (password !== confirmPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Passwords do not match'
        });
      }

      const user = await service.signup({ name, email, password });
      
      // Remove password from output
      user.password = undefined;

      res.status(201).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  };

Controller.prototype.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const { user, token } = await service.login(email, password);
      
      // Remove password from output
      user.password = undefined;

      res.status(200).json({
        status: 'success',
        data: { user, token }
      });
    } catch (error) {
      res.status(401).json({
        status: 'error',
        message: error.message
      });
    }
  };

module.exports = new Controller();
