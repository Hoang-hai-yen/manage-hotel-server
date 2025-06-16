const db = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM accountbooking WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (results.length === 0) return res.status(401).json({ message: 'Email not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { guest_account_id: user.guest_account_id },
      process.env.JWT_SECRET
    );

    res.json({ token });
  });
};
