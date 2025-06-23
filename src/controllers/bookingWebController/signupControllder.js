const db = require('../../db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  const {
    full_name,
    cccd,
    guest_type_id,
    email,
    phone_number,
    password
  } = req.body;

  // Truy vấn guest_type theo ID
  db.query(
    'SELECT guest_type_name, surcharge_rate FROM guest_types WHERE guest_type_id = ?',
    [guest_type_id],
    async (err, typeResults) => {
      if (err) return res.status(500).json({ message: 'Server error', error: err });
      if (typeResults.length === 0) {
        return res.status(400).json({ message: 'Invalid guest type' });
      }

      const guest_type_name = typeResults[0].guest_type_name;
      const surcharge_rate = typeResults[0].surcharge_rate;

      // Kiểm tra email trùng
      db.query('SELECT * FROM accountbooking WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });
        if (results.length > 0) {
          return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Thêm tài khoản mới
        db.query(
          `INSERT INTO accountbooking 
          (full_name, cccd, guest_type_id, email, phone_number, password_hash) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [full_name, cccd, guest_type_id, email, phone_number, hashedPassword],
          (err, result) => {
            if (err) {
              return res.status(500).json({ message: 'Failed to create account', error: err });
            }

            res.status(201).json({
              message: 'Account created successfully',
              user: {
                id: result.insertId,
                full_name,
                cccd,
                email,
                phone_number,
                gender: null,
                birthday: null,
                guest_type: {
                  id: guest_type_id,
                  name: guest_type_name,
                  surcharge_rate: parseFloat(surcharge_rate)
                }
              }
            });
          }
        );
      });
    }
  );
};
