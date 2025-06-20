const db = require('../db');

exports.getRecommendedRooms = async (req, res) => {
  const { room_type_id, check_in, check_out, adults, children } = req.body;

  if (!room_type_id || !check_in || !check_out || !adults)
    return res.status(400).json({ message: 'Missing required fields' });

  try {
    const totalGuests = parseFloat(adults) + parseFloat(children || 0) * 0.5;

    const [roomTypeRows] = await db.promise().query(
      `SELECT max_guests FROM roomtypes WHERE room_type_id = ?`,
      [room_type_id]
    );
    if (roomTypeRows.length === 0)
      return res.status(400).json({ message: 'Invalid room type' });

    const { max_guests } = roomTypeRows[0];

    const [roomRows] = await db.promise().query(
      `
      SELECT r.room_id
      FROM roomno r
      WHERE r.room_type_id = ?
        AND NOT EXISTS (
          SELECT 1 FROM room_bookings rb
          JOIN bookings b ON rb.booking_id = b.booking_id
          WHERE rb.room_id = r.room_id
            AND (? < b.check_out AND ? > b.check_in)
        )
      `,
      [room_type_id, check_in, check_out]
    );

    const suitableRooms = roomRows
      .filter(() => totalGuests <= max_guests + 1)
      .map(r => r.room_id);

    res.json({ recommended_rooms: suitableRooms });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
