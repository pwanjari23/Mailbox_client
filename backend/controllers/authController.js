const bcrypt = require('bcryptjs');
const { models } = require('../models');

exports.signup = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // 1. Double check fields presence
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields (email, password, confirmPassword) are mandatory.'
      });
    }

    // 2. Validate passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    // 3. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // 4. Check if email is already registered
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please try logging in.'
      });
    }

    // 5. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 6. Create user
    const newUser = await models.User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    // 7. Return success
    return res.status(201).json({
      success: true,
      message: 'User successfully signed up.',
      user: {
        id: newUser.id,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Error during signup:', error);
    
    // Sequelize Validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Validation error'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred. Please try again.'
    });
  }
};
