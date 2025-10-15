const jwt = require('jsonwebtoken');
const repository = require('./careerRepository');

function Service() {}
Service.prototype.signup = async (userData) => {
    // Check if user already exists
    const existingUser = await repository.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    return await repository.createUser(userData);
  };


Service.prototype.login = async (email, password) => {
    // Find user by email
    const user = await repository.findUserByEmail(email);
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new Error('Incorrect email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return { user, token };
  };

Service.prototype.googleAuth = async (profile) => {
    // Check if user exists with googleId
    let user = await repository.findUserByGoogleId(profile.id);
    
    if (!user) {
      // Check if user exists with email
      user = await repository.findUserByEmail(profile.emails[0].value);
      
      if (user) {
        // Update existing user with googleId
        user = await repository.updateUser(user._id, { googleId: profile.id });
      } else {
        // Create new user
        user = await repository.createUser({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          password: Math.random().toString(36).slice(-12) // Random password
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return { user, token };
  };


module.exports = new Service();