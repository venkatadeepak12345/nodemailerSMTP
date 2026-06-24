const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * JWT Authentication Middleware
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Access token is missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production';
    const decoded = jwt.verify(token, secret);
    
    // Attach decoded user info to request object
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized. Authentication token is invalid or has expired.' });
  }
};
