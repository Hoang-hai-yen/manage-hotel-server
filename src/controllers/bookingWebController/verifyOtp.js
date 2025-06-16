const db = require('../../db');
const bcrypt = require('bcryptjs');
const otps = require('./otpStore');

module.exports = async (req, res) => {
  const { email, otp, new_password } = req.body;

  const record = otps.get(email);
  if (!record || record.otp !== otp || record.isUsed) {
    return res.status(400).json({ message: 'Invalid or used OTP' });
  }

  if (Date.now() - record.createdAt > 5 * 60 * 1000) {
    return res.status(400).json({ message: 'OTP expired' });
  }

  const hashed = await bcrypt.hash(new_password, 10);
  db.query(
    'UPDATE accountbooking SET password_hash = ? WHERE email = ?',
    [hashed, email],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed to reset password', error: err });
      otps.set(email, { ...record, isUsed: true });
      res.json({ message: 'Password reset successfully' });
    }
  );
};
