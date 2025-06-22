const db = require('../../db');

exports.getProfile = (req, res) => {
  const { guest_account_id } = req.user;
  db.query('SELECT * FROM accountbooking WHERE guest_account_id = ?', [guest_account_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
};

exports.updatePersonal = (req, res) => {
  const { guest_account_id } = req.user;
  const { full_name, gender, birthday, cccd, guest_type_id } = req.body;
  db.query(
    `UPDATE accountbooking SET full_name=?, gender=?, birthday=?, cccd=?, guest_type_id=? WHERE guest_account_id=?`,
    [full_name, gender, birthday, cccd, guest_type_id, guest_account_id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed to update personal info', error: err });
      res.json({ message: 'Personal info updated successfully' });
    }
  );
};

exports.updateContact = (req, res) => {
  const { guest_account_id } = req.user;
  const { email, phone_number } = req.body;
  db.query(
    `UPDATE accountbooking SET email=?, phone_number=? WHERE guest_account_id=?`,
    [email, phone_number, guest_account_id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed to update contact info', error: err });
      res.json({ message: 'Contact info updated successfully' });
    }
  );
};

exports.deleteProfile = (req, res) => {
  const { guest_account_id } = req.user;
  db.query('DELETE FROM accountbooking WHERE guest_account_id=?', [guest_account_id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to delete account', error: err });
    res.json({ message: 'Account deleted successfully' });
  });
};