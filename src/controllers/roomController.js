const db = require('../db');

exports.getRooms = async (req, res) => {
  try {
    // Lấy ngày hôm nay theo giờ Việt Nam
    const todayVN = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh'
    }).format(new Date()); // → yyyy-mm-dd

    const [rows] = await db.promise().query(`
      SELECT 
  r.room_id,
  r.room_type_id,
  r.room_floor,
  GROUP_CONCAT(DISTINCT b.booking_id) AS active_bookings,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM room_bookings rb2
      JOIN bookings b2 ON rb2.booking_id = b2.booking_id
      WHERE rb2.room_id = r.room_id
        AND ? BETWEEN b2.check_in AND b2.check_out
        AND b2.status = 'Checked In'
    ) THEN 1
    ELSE 0
  END AS is_booked_today
FROM roomno r
LEFT JOIN room_bookings rb ON r.room_id = rb.room_id
LEFT JOIN bookings b ON rb.booking_id = b.booking_id AND b.check_out >= ? AND b.status = 'Booked'
GROUP BY r.room_id, r.room_type_id, r.room_floor
ORDER BY r.room_id

    `, [todayVN, todayVN]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};