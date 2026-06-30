const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const jwtSecret = process.env.JWT_SECRET || 'mailbox_super_secret_token_key';
    const decoded = jwt.verify(token, jwtSecret);

    // 3. Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT authentication error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
};
