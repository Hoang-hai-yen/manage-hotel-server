const db = require('../../db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = (req, res) => {
  const { identifier, password } = req.body;

  const query = `
    SELECT * FROM adminaccounts 
    WHERE admin_id = ? OR phone_number = ?
  `;

  db.query(query, [identifier, identifier], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Wrong ID or phone number' });
    }

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    const token = jwt.sign(
  { admin_id: admin.admin_id, role: admin.role },
  process.env.JWT_SECRET
);
  

    res.json({
      message: 'Signed in successfully',
      token,
      admin: {
        id: admin.admin_id,
        full_name: admin.full_name,
        role: admin.role
      }
    });
  });
};
