const db = require('../../db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    const {
    full_name, cccd, guest_type_id,
    email, phone_number, password
    } = req.body;

  db.query('SELECT * FROM accountbooking WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
     `INSERT INTO accountbooking 
      (full_name, cccd, guest_type_id, email, phone_number, password_hash) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, cccd, guest_type_id, email, phone_number, hashedPassword],
      (err) => {
        if (err) return res.status(500).json({ message: 'Failed to create account', error: err });
        res.status(201).json({ message: 'Account created successfully' });
      }
    );
  });
};
