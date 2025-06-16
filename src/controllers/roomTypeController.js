const db = require('../db');

// GET all room types
exports.getroomtypes = (req, res) => {
  db.query('SELECT * FROM roomtypes', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// POST create room type
exports.createroomtypes = (req, res) => {
  const { room_type_id, room_type_name, room_size, bed, note, max_guests, price_room, surcharge_rate } = req.body;
  db.query(
    'INSERT INTO roomtypes (room_type_id, room_type_name, room_size, bed, note, max_guests, price_room, surcharge_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [room_type_id, room_type_name, room_size, bed, note, max_guests, price_room, surcharge_rate],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ room_type_id, room_type_name, room_size, bed, note, max_guests, price_room, surcharge_rate });
    }
  );
};

// PUT update room type
exports.updateroomtypes = (req, res) => {
  const { room_type_id } = req.params;
  const { room_type_name, room_size, bed, note, max_guests, price_room, surcharge_rate } = req.body;
  db.query(
    'UPDATE roomtypes SET room_type_name=?, room_size=?, bed=?, note=?, max_guests=?, price_room=?, surcharge_rate=? WHERE room_type_id=?',
    [room_type_name, room_size, bed, note, max_guests, price_room, surcharge_rate, room_type_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ room_type_id, room_type_name, room_size, bed, note, max_guests, price_room, surcharge_rate });
    }
  );
};

// DELETE room type
exports.deleteroomtypes = (req, res) => {
  const { room_type_id } = req.params;
  db.query('DELETE FROM roomtypes WHERE room_type_id=?', [room_type_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Room type deleted' });
  });
};
