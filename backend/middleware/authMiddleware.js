const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protects routes by verifying the JWT token from the Authorization header
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract Bearer token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorized — no token provided');
    }

    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user object to request (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized — user not found');
    }

    next();
  } catch (error) {
    // Handle expired or malformed tokens
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.status(401);
      error.message = 'Not authorized — invalid or expired token';
    }
    next(error);
  }
};

module.exports = { protect };
