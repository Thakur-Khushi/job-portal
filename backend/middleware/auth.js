const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Support both 'x-auth-token' header and 'Authorization: Bearer <token>' format
  let token = req.header('x-auth-token');

  if (!token) {
    // Try to get token from Authorization header (Bearer format)
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
