const db = require('../db');

// GET all guest types
exports.getGuestTypes = (req, res) => {
  db.query('SELECT * FROM guest_types', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// POST create guest type
exports.createGuestType = (req, res) => {
  const { guest_type_name, surcharge_rate } = req.body;
  db.query(
    'INSERT INTO guest_types ( guest_type_name, surcharge_rate) VALUES (?, ?)',
    [guest_type_name, surcharge_rate],
    (err, result) => {
      if (err) return res.status(500).json(err, res);
      res.status(201).json({ guest_type_id:res.insertId, guest_type_name, surcharge_rate });
    }
  );
};

// PUT update guest type
exports.updateGuestType = (req, res) => {
  const { guest_type_id } = req.params;
  const { guest_type_name, surcharge_rate } = req.body;
  db.query(
    'UPDATE guest_types SET guest_type_name=?, surcharge_rate=? WHERE guest_type_id=?',
    [guest_type_name, surcharge_rate, guest_type_id],
    (err) => {
      if (err) return res.status(500).json(err, res);
      res.json({ guest_type_id:res.insertId, guest_type_name, surcharge_rate });
    }
  );
};

// DELETE guest type
exports.deleteGuestType = (req, res) => {
  const { guest_type_id } = req.params;
  db.query('DELETE FROM guest_types WHERE guest_type_id=?', [guest_type_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Guest type deleted' });
  });
};
