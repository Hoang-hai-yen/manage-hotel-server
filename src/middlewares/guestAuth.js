const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Guest not signed in' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.guest_account_id) throw new Error();

    req.user = decoded; // gán vào req.user
    next();
  } catch {
    res.status(401).json({ message: 'Invalid guest token' });
  }
};
