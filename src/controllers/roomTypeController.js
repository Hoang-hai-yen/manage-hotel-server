const db = require('../db');

// GET all room types
exports.getRoomTypes = (req, res) => {
  db.query('SELECT * FROM RoomType', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// POST create room type
exports.createRoomType = (req, res) => {
  const { roomTypeID, roomTypeName, roomSize, bed, note, maxGuests, roomPrice, surchargeRate } = req.body;
  db.query('INSERT INTO RoomType (roomTypeID, roomTypeName, roomSize, bed, note, maxGuests, roomPrice, surchargeRate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [roomTypeID, roomTypeName, roomSize, bed, note, maxGuests, roomPrice, surchargeRate], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ roomTypeID, roomTypeName, roomSize, bed, note, maxGuests, roomPrice, surchargeRate });
  });
};

// PUT update room type
exports.updateRoomType = (req, res) => {
  const { roomTypeID } = req.params;
  const { roomTypeName, roomSize, bed, note, maxGuests, roomPrice, surchargeRate } = req.body;
  db.query('UPDATE RoomType SET roomTypeName=?, roomSize=?, bed=?, note=?, maxGuests=?, roomPrice=?, surchargeRate=? WHERE roomTypeID=?', [roomTypeName, roomSize, bed, note, maxGuests, roomPrice, surchargeRate, roomTypeID], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ roomTypeID, roomTypeName, roomSize, bed, note, maxGuests, roomPrice, surchargeRate });
  });
};

// DELETE room type
exports.deleteRoomType = (req, res) => {
  const { roomTypeID } = req.params;
  db.query('DELETE FROM RoomType WHERE roomTypeID=?', [roomTypeID], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Room type deleted' });
  });
};