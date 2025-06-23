const db = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res) => {
  const { email, password } = req.body;

const query = `
  SELECT ab.*, gt.guest_type_name, gt.surcharge_rate
  FROM accountbooking ab
  LEFT JOIN guest_types gt ON ab.guest_type_id = gt.guest_type_id
  WHERE ab.email = ?
`;


  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (results.length === 0) return res.status(401).json({ message: 'Email not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { guest_account_id: user.guest_account_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      message: 'Signed in successfully',
      token,
      user: {
        id: user.guest_account_id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        cccd: user.cccd,
        gender: user.gender,
        birthday: user.birthday,
        guest_type_name: user.guest_type_name,       
        surcharge_rate: user.surcharge_rate         
      }
    });
  });
};
