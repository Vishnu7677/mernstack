require('dotenv').config();
const logger = require('../logger/logger');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { crypto, datetime } = require('../util/UtilManager');
const { Account, User } = require('../models/mongo/mongodb');

// Check if OTP has expired
const isExpired = function (expiryTime) {
  if (!expiryTime) return true;
  const diff = datetime.dateDifferenceBetween(expiryTime, datetime.now(), 'seconds');
  return diff < 0;
};

// Create a new user for social login
const createNewUserBySocialAccount = async function (emailENC, social, account) {
  const newUserId = new mongoose.Types.ObjectId().toHexString();
  const defaultApp = DefaultApps.apps;

  const existingUser = await User.findOne({ email: emailENC });
  if (existingUser) {
    throw new Error('User already exists with this email.');
  }

  await new User({
    _id: newUserId,
    social,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: emailENC,
    apps: defaultApp,
    login: [],
  }).save();

  await new Account({ _id: newUserId, ...account }).save();
};

// Passport Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'otp'
  },
  async function (username, password, done) {
    const usernameENC = crypto.encrypt(username);

    const user = await User.findOne({ email: usernameENC }) || await User.findOne({ mobile: usernameENC });
    if (!user) return done(null, false, { message: 'User does not exist.' });

    try {
      const isValidPassword = await crypto.hashCompare(password, user.password) || await crypto.hashCompare(password, user.passwordOtp);
      if (!isValidPassword) return done(null, false, { message: 'Incorrect OTP' });

      if (crypto.hashCompare(password, user.passwordOtp) && isExpired(user.otpExpiry)) {
        return done(null, false, { message: 'OTP Expired.' });
      }

      return done(null, user.toJSON());
    } catch (e) {
      logger.error(e.message);
      return done(null, false, { message: 'Error while processing login' });
    }
  }
));

passport.use(new LocalStrategy(
  (username, password, done) => {
    // Replace with your database query to find the user
    const user = { id: 1, username: 'test', password: 'password123' };

    if (username === user.username && password === user.password) {
      return done(null, user); // Successful authentication
    } else {
      return done(null, false, { message: 'Invalid credentials' });
    }
  }
));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser((id, done) => {
  const user = { id: 1, username: 'test', password: 'password123' }; // Simulate database lookup
  done(null, user);
});



module.exports = passport;
