// Simple sanitization middleware to prevent NoSQL injection
const sanitize = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        // Remove MongoDB operators
        req.query[key] = req.query[key].replace(/[$]/g, '');
      }
    }
  }

  // Sanitize body parameters
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Remove MongoDB operators
        req.body[key] = req.body[key].replace(/[$]/g, '');
      }
    }
  }

  next();
};

module.exports = sanitize;
