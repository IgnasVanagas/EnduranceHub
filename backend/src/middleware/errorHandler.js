// Express error handling utilities
const notFound = (req, res, _next) => {
  res.status(404).json({ message: 'Route not found' });
};

const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  const payload = {
    message: err.message || 'Internal server error'
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  console.error('[error]', err.message);
  res.status(status).json(payload);
};

module.exports = {
  notFound,
  errorHandler
};
