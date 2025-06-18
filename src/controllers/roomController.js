const db = require('../db');

exports.getRooms = (req, res) => {
  db.query('SELECT * FROM roomno', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.createRoom = (req, res) => {
  const { room_id, room_type_id, room_floor, booking_id, is_booked } = req.body;

  if (!room_id || !room_type_id || !room_floor) {
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

exports.updateRoom = (req, res) => {
  const { room_id } = req.params;
  const { room_type_id, room_floor, booking_id, is_booked } = req.body;

  const checkQuery = 'SELECT * FROM roomtypes WHERE room_type_id = ?';
  db.query(checkQuery, [room_type_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });

    if (results.length === 0) {
      return res.status(400).json({ error: 'room_type_id không tồn tại trong bảng roomtypes' });
    }

    const insertQuery = 'UPDATE roomno SET room_type_id=?, room_floor=?, booking_id=?, is_booked=? WHERE room_id=?';
    db.query(
    insertQuery,
    [room_type_id, room_floor, booking_id || null, is_booked || 0, room_id],
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

exports.deleteRoom = (req, res) => {
  const { room_id } = req.params;
  db.query('DELETE FROM roomno WHERE room_id=?', [room_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Room deleted' });
  });
};