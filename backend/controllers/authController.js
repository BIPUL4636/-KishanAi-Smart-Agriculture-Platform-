const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generates a signed JWT token with user ID as payload (expires in 30 days)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Registers a new user with name, email, password, and optional state
const register = async (req, res, next) => {
  try {
    const { name, email, password, state } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('An account with this email already exists');
    }

    // Create user (password is hashed via pre-save hook in User model)
    const user = await User.create({ name, email, password, state });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        state: user.state,
        token: generateToken(user._id),
      },
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
};

// Authenticates a user by email and password, returns a JWT token
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find user and explicitly include password field for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Verify password against stored hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        state: user.state,
        token: generateToken(user._id),
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

// Returns the currently authenticated user's profile
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        state: user.state,
        createdAt: user.createdAt,
      },
      message: 'User profile fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
