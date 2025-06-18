const db = require('../db');

exports.getRooms = (req, res) => {
  db.query('SELECT * FROM roomno', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};