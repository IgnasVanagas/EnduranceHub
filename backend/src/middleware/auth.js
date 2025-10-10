const jwt = require('jsonwebtoken');
const config = require('../config/vars');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findByPk(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token subject' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (roles.length && !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }

  next();
};

module.exports = {
  authenticate,
  authorize
};
