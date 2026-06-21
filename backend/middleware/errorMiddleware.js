// Catches requests to undefined routes and forwards a 404 error
const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler — returns consistent JSON error responses across all endpoints
const errorHandler = (err, req, res, next) => {
  // Default to 500 if status code hasn't been set by previous middleware
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    data: null,
    message: err.message || 'Internal Server Error',
    // Hide stack trace in production for security
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
