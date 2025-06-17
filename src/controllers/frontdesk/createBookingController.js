const db = require('../../db');

exports.createBooking = async (req, res) => {
  const {
    guest_fullname, guest_id_card, guest_phone, guest_email, guest_address,
    guest_type_id, check_in, check_out, room_type_id,
    adults, children, payment_method, room_id, companions = []
  } = req.body;

  if (!guest_fullname || !guest_id_card || !check_in || !check_out || !room_type_id || !adults)
    return res.status(400).json({ message: 'Missing required fields' });

  const totalGuests = parseFloat(adults) + parseFloat(children || 0) * 0.5;

  try {
    const [roomTypeRows] = await db.promise().query(
      `SELECT price_room AS nightly_rate, max_guests FROM roomtypes WHERE room_type_id = ?`,
      [room_type_id]
    );
    if (roomTypeRows.length === 0)
      return res.status(400).json({ message: 'Invalid room type' });

    const { nightly_rate, max_guests } = roomTypeRows[0];
    if (parseInt(adults) < 1)
      return res.status(400).json({ message: 'At least 1 adult is required' });

    const [roomRows] = await db.promise().query(
      `SELECT room_id FROM roomno 
       WHERE room_type_id = ? AND is_booked = 0`,
      [room_type_id]
    );
    const suitableRooms = roomRows
      .filter(() => totalGuests <= max_guests + 1)
      .map(r => r.room_id);
    const recommended_rooms = suitableRooms.join(',');

    const [result] = await db.promise().query(
      `INSERT INTO bookings 
        (guest_fullname, guest_id_card, guest_phone, guest_email, guest_address, guest_type_id,
         check_in, check_out, room_id, recommended_rooms, room_type_id, adults, children,
         nightly_rate, payment_method, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Due In')`,
      [
        guest_fullname, guest_id_card, guest_phone, guest_email, guest_address, guest_type_id,
        check_in, check_out, room_id || null, recommended_rooms, room_type_id, adults, children,
        nightly_rate, payment_method
      ]
    );
    const booking_id = result.insertId;

    for (const c of companions) {
      await db.promise().query(
        `INSERT INTO bookingcompanions 
          (booking_id, fullname, id_card, address, guest_type_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [booking_id, c.fullname, c.id_card, c.address, c.guest_type_id]
      );
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking_id,
      recommended_rooms: suitableRooms
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
