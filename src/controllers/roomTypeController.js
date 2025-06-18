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

exports.getRoomsByRoomType = (req, res) => {
  const { room_type_id } = req.params;
  db.query('SELECT * FROM roomno WHERE room_type_id = ?', [room_type_id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
  db.query('SELECT * FROM roomno', (err, results) => {
  });
};

exports.createRoomByRoomType = (req, res) => {
  const [ room_type_id ] = req.params
  const { room_id, room_floor, booking_id, is_booked } = req.body;

  if (!room_id || !room_floor) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 1. Kiểm tra room_type_id có tồn tại không
  const checkQuery = 'SELECT * FROM roomtypes WHERE room_type_id = ?';
  db.query(checkQuery, [room_type_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });

    if (results.length === 0) {
      return res.status(400).json({ error: 'room_type_id không tồn tại trong bảng roomtypes' });
    }

    // 2. Nếu hợp lệ, thực hiện INSERT
    const insertQuery = `
      INSERT INTO roomno (room_id, room_type_id, room_floor, booking_id, is_booked)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
      insertQuery,
      [room_id, room_type_id, room_floor, booking_id || null, is_booked || 0],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Insert error', details: err });

        res.status(201).json({
          message: 'Room created successfully',
          data: {
            room_id,
            room_type_id,
            room_floor,
            booking_id: booking_id || null,
            is_booked: is_booked || 0
          }
        });
      }
    );
  });
};

exports.updateRoomByRoomType = (req, res) => {
  const { room_type_id ,room_id } = req.params;
  const { room_floor, booking_id, is_booked } = req.body;

  const checkQuery = 'SELECT * FROM roomtypes WHERE room_type_id = ?';
  db.query(checkQuery, [room_type_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });

    if (results.length === 0) {
      return res.status(400).json({ error: 'room_type_id không tồn tại trong bảng roomtypes' });
    }

    const insertQuery = 'UPDATE roomno SET room_floor=?, booking_id=?, is_booked=? WHERE room_id=?';
    db.query(
    insertQuery,
    [room_floor, booking_id || null, is_booked || 0, room_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ 
        message: 'Room updated successfully',
        data: {
          room_id,
          room_type_id,
          room_floor,
          booking_id: booking_id || null,
          is_booked: is_booked || 0
        }
       });
    }
  );
  });
};

exports.deleteRoomByRoomType = (req, res) => {
  const { room_type_id, room_id } = req.params;
  db.query('DELETE FROM roomno WHERE room_id=?', [room_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Room deleted' });
  });
};