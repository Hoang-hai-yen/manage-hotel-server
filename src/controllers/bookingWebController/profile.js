const db = require('../../db');

module.exports = (req, res) => {
  const guestId = req.user.guest_account_id;

  db.query(
    `SELECT full_name, cccd, guest_type_id, gender, birthday, email, phone_number, created_at 
     FROM accountbooking WHERE guest_account_id = ?`,
    [guestId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to retrieve profile', error: err });
      res.json(results[0]);
    }
  );
};
