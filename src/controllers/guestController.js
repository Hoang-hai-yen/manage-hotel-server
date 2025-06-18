const db = require('../db');

// GET all guests
exports.getGuests = (req, res) => {
  db.query('SELECT * FROM guests', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};