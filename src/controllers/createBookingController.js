const db = require('../db');

exports.createBooking = async (req, res) => {
  const {
    guest_fullname, guest_id_card, guest_phone, guest_email, guest_address,
    guest_type_id, check_in, check_out, room_type_id,
    adults, children, payment_method, room_id, recommended_rooms, status = 'Due In', companions = []
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
    if (room_id) {
      const [conflict] = await db.promise().query(`
        SELECT 1 FROM room_bookings rb
        JOIN bookings b ON rb.booking_id = b.booking_id
        WHERE rb.room_id = ?
        AND (? < b.check_out AND ? > b.check_in)
    `, [room_id, check_in, check_out]);

  if (conflict.length > 0) {
    return res.status(400).json({ message: 'This room is already booked during the selected dates' });
  }
}

    

    const [result] = await db.promise().query(
      `INSERT INTO bookings 
      (guest_fullname, guest_id_card, guest_phone, guest_email, guest_address, guest_type_id, check_in, check_out, room_id, room_type_id, adults, children, nightly_rate, payment_method, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    guest_fullname, guest_id_card, guest_phone, guest_email, guest_address, guest_type_id,
    check_in, check_out, room_id || null, room_type_id, adults, children,
    nightly_rate, payment_method, status
  ]
);

    const booking_id = result.insertId;

    if (room_id) {
  await db.promise().query(
    `INSERT INTO room_bookings (booking_id, room_id) VALUES (?, ?)`,
    [booking_id, room_id]
  );
}

    for (const c of companions) {
      await db.promise().query(
        `INSERT INTO bookingcompanions 
          (booking_id, fullname, id_card, address, guest_type_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [booking_id, c.fullname, c.id_card, c.address, c.guest_type_id]
      );
    }

    await db.promise().query(
  `INSERT INTO guests (fullname, id_card, guest_type_id, source_type, booking_id, room_id, status)
   VALUES (?, ?, ?, 'Booking', ?, ?, 'upcoming')`,
  [guest_fullname, guest_id_card, guest_type_id, booking_id, room_id || null]
);

for (const c of companions) {
  await db.promise().query(
    `INSERT INTO guests (fullname, id_card, guest_type_id, source_type, booking_id, room_id, status)
     VALUES (?, ?, ?, 'Companion', ?, ?, 'upcoming')`,
    [c.fullname, c.id_card, c.guest_type_id, booking_id, room_id || null]
  );
}

const [bookingRows] = await db.promise().query(
  `SELECT b.*, rt.room_type_name, gt.guest_type_name
   FROM bookings b
   LEFT JOIN roomtypes rt ON b.room_type_id = rt.room_type_id
   LEFT JOIN guest_types gt ON b.guest_type_id = gt.guest_type_id
   WHERE b.booking_id = ?`,
  [booking_id]
);

const [companionRows] = await db.promise().query(
  `SELECT fullname, id_card, address, guest_type_id 
   FROM bookingcompanions 
   WHERE booking_id = ?`,
  [booking_id]
);

res.status(201).json({
  message: 'Booking created successfully',
  ...bookingRows[0],
  companions: companionRows
});


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

async function autoUpdateDueOutStatus() {
  try {
    await db.promise().query(
      `UPDATE bookings 
       SET status = 'Due Out' 
       WHERE status = 'Checked In' 
       AND DATEDIFF(check_out, CURDATE()) <= 1`
    );
  } catch (err) {
    console.error('Failed to update due out status:', err.message);
  }
}

// GET all bookings (cho UI hiển thị)
exports.getAllBookings = async (req, res) => {
  try {
    await autoUpdateDueOutStatus(); 

    const [rows] = await db.promise().query(`
      SELECT booking_id, guest_fullname, room_id, room_type_id, check_in, check_out, status
      FROM bookings
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

exports.getBookingById = async (req, res) => {
  const booking_id = req.params.id;

  try {
    const [rows] = await db.promise().query(
      `SELECT b.*, 
              rt.room_type_name, 
              gt.guest_type_name
       FROM bookings b
       LEFT JOIN roomtypes rt ON b.room_type_id = rt.room_type_id
       LEFT JOIN guest_types gt ON b.guest_type_id = gt.guest_type_id
       WHERE b.booking_id = ?`,
      [booking_id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: 'Booking not found' });

    const booking = rows[0];

    const [companions] = await db.promise().query(
      `SELECT fullname, id_card, address, guest_type_id FROM bookingcompanions WHERE booking_id = ?`,
      [booking_id]
    );

    res.json({ ...booking, companions });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};



// PUT update booking 
exports.updateBooking = async (req, res) => {
  const booking_id = req.params.id;
  const {
    guest_fullname, guest_id_card, guest_phone, guest_email, guest_address,
    guest_type_id, check_in, check_out, room_id, room_type_id,
    adults, children, nightly_rate, payment_method, status
  } = req.body;

  try {
    await db.promise().query(
      `UPDATE bookings SET
        guest_fullname=?, guest_id_card=?, guest_phone=?, guest_email=?, guest_address=?, guest_type_id=?,
        check_in=?, check_out=?, room_id=?, room_type_id=?, adults=?, children=?,
        nightly_rate=?, payment_method=?, status=?
      WHERE booking_id = ?`,
      [guest_fullname, guest_id_card, guest_phone, guest_email, guest_address, guest_type_id,
        check_in, check_out, room_id, room_type_id, adults, children, nightly_rate, payment_method, status, booking_id]
    );

    const statusMap = {
  'Due In': 'upcoming',
  'Checked In': 'staying',
  'Checked Out': 'left'
};

const guestStatus = statusMap[status];

await db.promise().query(
  `UPDATE guests SET status = ? WHERE booking_id = ?`,
  [guestStatus, booking_id]
);

    res.json({ message: 'Booking updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

exports.deleteBooking = async (req, res) => {
  const booking_id = req.params.id;

  try {
    await db.promise().query(
      'DELETE FROM bookingcompanions WHERE booking_id = ?',
      [booking_id]
    );

    await db.promise().query(
      'DELETE FROM bookings WHERE booking_id = ?',
      [booking_id]
    );

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
};
