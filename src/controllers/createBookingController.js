// createBookingController.js (Full Controller Updated)
const db = require('../db');

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  const {
    guest_fullname, guest_id_card, guest_phone, guest_email, guest_address,
    guest_type_name, check_in, check_out, room_type_id,
    adults, children, payment_method, room_id, status = 'Due In', companions = []
  } = req.body;

  if (!guest_fullname || !guest_id_card || !check_in || !check_out || !room_type_id || !adults || !guest_type_name)
    return res.status(400).json({ message: 'Missing required fields' });
  if (new Date(check_in) >= new Date(check_out))
    return res.status(400).json({ message: 'Check-out date must be after check-in date' });
  if (new Date(check_in) < new Date())
    return res.status(400).json({ message: 'Check-in date cannot be in the past' });
  if (adults < 1)
    return res.status(400).json({ message: 'At least 1 adult is required' });
  if (companions.some(c => !c.fullname || !c.id_card || !c.guest_type_id))
    return res.status(400).json({ message: 'Companion details are incomplete' });

  try {
    const [guestTypeRows] = await db.promise().query(
      `SELECT guest_type_id, guest_type_name, surcharge_rate FROM guest_types WHERE guest_type_name = ?`,
      [guest_type_name]
    );
    if (guestTypeRows.length === 0)
      return res.status(400).json({ message: 'Invalid guest type name' });

    const guest_type = guestTypeRows[0];

    const [roomTypeRows] = await db.promise().query(
      `SELECT price_room AS nightly_rate, max_guests FROM roomtypes WHERE room_type_id = ?`,
      [room_type_id]
    );
    if (roomTypeRows.length === 0)
      return res.status(400).json({ message: 'Invalid room type' });

    const { nightly_rate } = roomTypeRows[0];

    if (parseInt(adults) < 1)
      return res.status(400).json({ message: 'At least 1 adult is required' });

    if (room_id) {
      const [conflict] = await db.promise().query(
        `SELECT 1 FROM room_bookings rb
         JOIN bookings b ON rb.booking_id = b.booking_id
         WHERE rb.room_id = ? AND (? < b.check_out AND ? > b.check_in)`,
        [room_id, check_in, check_out]
      );
      if (conflict.length > 0)
        return res.status(400).json({ message: 'This room is already booked during the selected dates' });
    }

    const [result] = await db.promise().query(
      `INSERT INTO bookings 
       (guest_fullname, guest_id_card, guest_phone, guest_email, guest_address, guest_type_id, check_in, check_out, room_id, room_type_id, adults, children, nightly_rate, payment_method, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        guest_fullname, guest_id_card, guest_phone, guest_email, guest_address, guest_type.guest_type_id,
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
        `INSERT INTO bookingcompanions (booking_id, fullname, id_card, address, guest_type_id)
         VALUES (?, ?, ?, ?, ?)`,
        [booking_id, c.fullname, c.id_card, c.address, c.guest_type_id]
      );

      await db.promise().query(
        `INSERT INTO guests (fullname, id_card, guest_type_id, source_type, booking_id, room_id, status)
         VALUES (?, ?, ?, 'Companion', ?, ?, 'upcoming')`,
        [c.fullname, c.id_card, c.guest_type_id, booking_id, room_id || null]
      );
    }

    await db.promise().query(
  `INSERT INTO guests (fullname, id_card, address, guest_type_id, source_type, booking_id, room_id, status)
   VALUES (?, ?, ?, 'Booking', ?, ?, 'upcoming')`,
  [guest_fullname, guest_id_card, guest_address, guest_type_id, booking_id, room_id || null]
);

for (const c of companions) {
  await db.promise().query(
    `INSERT INTO guests (fullname, id_card, address, guest_type_id, source_type, booking_id, room_id, status)
     VALUES (?, ?, ?, 'Companion', ?, ?, 'upcoming')`,
    [c.fullname, c.id_card, c.address, c.guest_type_id, booking_id, room_id || null]
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
      `SELECT fullname, id_card, address, guest_type_id FROM bookingcompanions WHERE booking_id = ?`,
      [booking_id]
    );

    const [guestTypes] = await db.promise().query(
      `SELECT guest_type_id, guest_type_name, surcharge_rate FROM guest_types`
    );

    res.status(201).json({
      message: 'Booking created successfully',
      ...bookingRows[0],
      companions: companionRows,
      guest_types: guestTypes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// AUTO STATUS UPDATE
async function autoUpdateDueOutStatus() {
  try {
    await db.promise().query(
      `UPDATE bookings SET status = 'Due Out' WHERE status = 'Checked In' AND DATEDIFF(check_out, CURDATE()) <= 1`
    );
  } catch (err) {
    console.error('Failed to update due out status:', err.message);
  }
}

// GET ALL BOOKINGS
exports.getAllBookings = async (req, res) => {
  try {
    await autoUpdateDueOutStatus();
    const [rows] = await db.promise().query(
      `SELECT booking_id, guest_fullname, room_id, room_type_id, check_in, check_out, status FROM bookings`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// GET BOOKING BY ID
exports.getBookingById = async (req, res) => {
  const booking_id = req.params.id;

  try {
    const [rows] = await db.promise().query(
      `SELECT b.*, rt.room_type_name, gt.guest_type_name
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

// UPDATE BOOKING
exports.updateBooking = async (req, res) => {
  const booking_id = req.params.id;
  const {
    guest_fullname, guest_id_card, guest_phone, guest_email, guest_address,
    guest_type_name, check_in, check_out, room_id, room_type_id,
    adults, children, nightly_rate, payment_method, status = 'Due In', companions = []
  } = req.body;
  if (!guest_fullname || !guest_id_card || !check_in || !check_out || !room_type_id || !adults || !guest_type_name)
    return res.status(400).json({ message: 'Missing required fields' });
  if (new Date(check_in) >= new Date(check_out))
    return res.status(400).json({ message: 'Check-out date must be after check-in date' });
  if (new Date(check_in) < new Date())
    return res.status(400).json({ message: 'Check-in date cannot be in the past' });
  if (adults < 1)
    return res.status(400).json({ message: 'At least 1 adult is required' });

  try {
    const [guestTypeRows] = await db.promise().query(
      `SELECT guest_type_id FROM guest_types WHERE guest_type_name = ?`,
      [guest_type_name]
    );
    if (guestTypeRows.length === 0)
      return res.status(400).json({ message: 'Invalid guest_type_name' });
    const guest_type_id = guestTypeRows[0].guest_type_id;

    await db.promise().query(
      `UPDATE bookings SET guest_fullname=?, guest_id_card=?, guest_phone=?, guest_email=?, guest_address=?, guest_type_id=?,
       check_in=?, check_out=?, room_id=?, room_type_id=?, adults=?, children=?, nightly_rate=?, payment_method=?, status=?
       WHERE booking_id = ?`,
      [guest_fullname, guest_id_card, guest_phone, guest_email, guest_address, guest_type_id,
       check_in, check_out, room_id, room_type_id, adults, children,
       nightly_rate, payment_method, status, booking_id]
    );

    const statusMap = {
      'Due In': 'upcoming',
      'Checked In': 'staying',
      'Checked Out': 'left'
    };
    const guestStatus = statusMap[status];

    await db.promise().query(
      `UPDATE guests SET status = ?, room_id = ? WHERE booking_id = ?`,
      [guestStatus, room_id, booking_id]
    );

    await db.promise().query(`DELETE FROM room_bookings WHERE booking_id = ?`, [booking_id]);
    if (room_id) {
      await db.promise().query(`INSERT INTO room_bookings (booking_id, room_id) VALUES (?, ?)`, [booking_id, room_id]);
    }

    await db.promise().query(
      `UPDATE guests SET fullname = ?, id_card = ?, guest_type_id = ? WHERE booking_id = ? AND source_type = 'Booking'`,
      [guest_fullname, guest_id_card, guest_type_id, booking_id]
    );

    await db.promise().query(`DELETE FROM bookingcompanions WHERE booking_id = ?`, [booking_id]);
    await db.promise().query(`DELETE FROM guests WHERE booking_id = ? AND source_type = 'Companion'`, [booking_id]);

    for (const c of companions) {
      await db.promise().query(
        `INSERT INTO bookingcompanions (booking_id, fullname, id_card, address, guest_type_id)
         VALUES (?, ?, ?, ?, ?)`,
        [booking_id, c.fullname, c.id_card, c.address, c.guest_type_id]
      );

      await db.promise().query(
        `INSERT INTO guests (fullname, id_card, guest_type_id, source_type, booking_id, room_id, status)
         VALUES (?, ?, ?, 'Companion', ?, ?, ?)`,
        [c.fullname, c.id_card, c.guest_type_id, booking_id, room_id || null, guestStatus]
      );
    }
    // Update is_booked trong bảng roomno dựa vào status
if (status === 'Checked In') {
  await db.promise().query(`UPDATE roomno SET is_booked = 1 WHERE room_id = ?`, [room_id]);
} else if (status === 'Checked Out') {
  await db.promise().query(`UPDATE roomno SET is_booked = 0 WHERE room_id = ?`, [room_id]);
}


    res.json({ message: 'Booking updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking', details: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  const booking_id = req.params.id;
  const connection = db.promise();

  try {
    await connection.beginTransaction();

    await connection.query(`DELETE FROM invoiceservices WHERE booking_id = ?`, [booking_id]);
    await connection.query(`DELETE FROM invoicedetails WHERE booking_id = ?`, [booking_id]);
    await connection.query(`DELETE FROM invoices WHERE booking_id = ?`, [booking_id]);
    await connection.query(`DELETE FROM servicerequests WHERE booking_id = ?`, [booking_id]);
    await connection.query(`DELETE FROM bookingcompanions WHERE booking_id = ?`, [booking_id]);
    await connection.query(`DELETE FROM guests WHERE booking_id = ?`, [booking_id]);
    await connection.query(`DELETE FROM room_bookings WHERE booking_id = ?`, [booking_id]);
    const [deleteResult] = await connection.query('DELETE FROM bookings WHERE booking_id = ?', [booking_id]);
    
    if (deleteResult.affectedRows === 0) {
        throw new Error('Booking not found or already deleted');
    }

    await connection.commit();
    res.json({ message: 'Booking and all related data deleted successfully' });

  } catch (err) {
    await connection.rollback();
    console.error(`Transaction ROLLBACK. Error deleting booking ID ${booking_id}:`, err);
    res.status(500).json({ error: 'Failed to delete booking. A server error occurred.' });
  } finally {
      connection.release();
  }
};

