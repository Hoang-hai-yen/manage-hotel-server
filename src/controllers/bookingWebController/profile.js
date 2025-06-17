const db = require('../../db');

module.exports = {
  get: (req, res) => {
    const guestId = req.user.guest_account_id;

    db.query(`
      SELECT 
        a.full_name, 
        a.cccd, 
        a.gender, 
        a.birthday, 
        a.email, 
        a.phone_number,
        g.guest_type_id,
        g.guest_type_name
      FROM accountbooking a
      LEFT JOIN guest_types g ON a.guest_type_id = g.guest_type_id
      WHERE a.guest_account_id = ? AND a.is_deleted = FALSE
    `, [guestId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to retrieve profile', error: err });
      if (results.length === 0) return res.status(404).json({ message: 'User not found' });
      res.json(results[0]);
    });
  },

  update: (req, res) => {
    const id = req.user.guest_account_id;
    const {
      full_name, cccd, guest_type_id,
      gender, birthday,
      email, phone_number
    } = req.body;

    db.query(`
      UPDATE accountbooking 
      SET full_name=?, cccd=?, guest_type_id=?, gender=?, birthday=?, email=?, phone_number=?
      WHERE guest_account_id=? AND is_deleted = FALSE
    `,
      [full_name, cccd, guest_type_id, gender, birthday, email, phone_number, id],
      (err) => {
        if (err) return res.status(500).json({ message: 'Update failed', error: err });
        res.json({ message: 'Profile updated successfully' });
      }
    );
  },

  delete: (req, res) => {
    const id = req.user.guest_account_id;

    db.query(
      `UPDATE accountbooking SET is_deleted = TRUE WHERE guest_account_id = ?`,
      [id],
      (err) => {
        if (err) return res.status(500).json({ message: 'Failed to delete profile', error: err });
        res.json({ message: 'Profile deleted successfully' });
      }
    );
  }
};
