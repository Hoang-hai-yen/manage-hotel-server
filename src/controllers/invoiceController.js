
const db = require('../db');

exports.getInvoiceByBookingId = async (req, res) => {
  const booking_id = req.params.booking_id;

  try {
    // Tạo invoice nếu chưa có
    const [existingInvoice] = await db.promise().query(
      `SELECT * FROM invoices WHERE booking_id = ?`,
      [booking_id]
    );

    if (existingInvoice.length === 0) {
      const [roomData] = await db.promise().query(
        `SELECT rt.price_room, DATEDIFF(b.check_out, b.check_in) AS nights, b.room_type_id
         FROM bookings b
         JOIN roomtypes rt ON b.room_type_id = rt.room_type_id
         WHERE b.booking_id = ?`,
        [booking_id]
      );

      if (roomData.length === 0)
        return res.status(404).json({ message: 'Booking not found' });

      const { price_room, nights } = roomData[0];
      const total_room = price_room * nights;

      const total_service = 0;
      const vat_rate = 0.08;

      await db.promise().query(
        `INSERT INTO invoices (invoice_id, booking_id, total_room, total_service, vat_rate, total_amount)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `INV${booking_id.toString().padStart(4, '0')}`,
          booking_id,
          total_room,
          total_service,
          vat_rate,
          0
        ]
      );
    }

    // Tự động tạo invoicedetails nếu thiếu
    const [roomDetailExists] = await db.promise().query(
      `SELECT * FROM invoicedetails WHERE booking_id = ?`,
      [booking_id]
    );
    if (roomDetailExists.length === 0) {
      const [roomData] = await db.promise().query(
        `SELECT b.room_type_id, DATEDIFF(b.check_out, b.check_in) AS night_count, rt.price_room
         FROM bookings b
         JOIN roomtypes rt ON b.room_type_id = rt.room_type_id
         WHERE b.booking_id = ?`,
        [booking_id]
      );

      if (roomData.length > 0) {
        const { room_type_id, night_count, price_room } = roomData[0];
        const room_total = price_room * night_count;

        await db.promise().query(
          `INSERT INTO invoicedetails (booking_id, room_type_id, night_count, room_price, room_total)
           VALUES (?, ?, ?, ?, ?)`,
          [booking_id, room_type_id, night_count, price_room, room_total]
        );
      }
    }

    // Tự động tạo invoiceservices nếu thiếu
    const [serviceDetailExists] = await db.promise().query(
      `SELECT * FROM invoiceservices WHERE booking_id = ?`,
      [booking_id]
    );

    if (serviceDetailExists.length === 0) {
      const [services] = await db.promise().query(
        `SELECT sr.service_id, s.service_name, s.price_service AS service_price, sr.amount
         FROM servicerequests sr
         JOIN services s ON sr.service_id = s.service_id
         WHERE sr.booking_id = ?`,
        [booking_id]
      );

      for (const s of services) {
        const service_total = s.service_price * s.amount;
        await db.promise().query(
          `INSERT INTO invoiceservices (booking_id, service_id, service_name, service_price, quantity, service_total)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [booking_id, s.service_id, s.service_name, s.service_price, s.amount, service_total]
        );
      }
    }

    // Lấy dữ liệu chi tiết
    const [roomDetails] = await db.promise().query(
      `SELECT room_type_id, night_count, room_price, room_total
       FROM invoicedetails WHERE booking_id = ?`,
      [booking_id]
    );
    const [serviceDetails] = await db.promise().query(
      `SELECT service_name, service_price, quantity, service_total
       FROM invoiceservices WHERE booking_id = ?`,
      [booking_id]
    );

    // Tính toán tổng tiền thật từ chi tiết
    const [[roomTotalRow]] = await db.promise().query(
      `SELECT SUM(room_total) AS total_room FROM invoicedetails WHERE booking_id = ?`,
      [booking_id]
    );
    const [[serviceTotalRow]] = await db.promise().query(
      `SELECT SUM(service_total) AS total_service FROM invoiceservices WHERE booking_id = ?`,
      [booking_id]
    );

    const total_room_val = parseFloat(roomTotalRow.total_room) || 0;
    const total_service_val = parseFloat(serviceTotalRow.total_service) || 0;
    const vat_rate_val = 0.08;
    const vat_amount = (total_room_val + total_service_val) * vat_rate_val;

    const [guests] = await db.promise().query(
      `SELECT g.guest_type_id, gt.surcharge_rate
       FROM guests g
       JOIN guest_types gt ON g.guest_type_id = gt.guest_type_id
       WHERE g.booking_id = ?`,
      [booking_id]
    );
    const surcharge_guest_type = guests.length > 0
      ? Math.max(...guests.map(g => parseFloat(g.surcharge_rate)))
      : 0;

    const [bookingData] = await db.promise().query(
      `SELECT adults, children, room_type_id
       FROM bookings
       WHERE booking_id = ?`,
      [booking_id]
    );
    if (bookingData.length === 0)
      return res.status(404).json({ message: 'Booking not found' });

    const { adults, children, room_type_id } = bookingData[0];
    const guestCount = parseFloat(adults) + parseFloat(children || 0) * 0.5;

    const [roomTypeInfo] = await db.promise().query(
      `SELECT max_guests, surcharge_rate
       FROM roomtypes
       WHERE room_type_id = ?`,
      [room_type_id]
    );
    const over_capacity = guestCount > roomTypeInfo[0].max_guests;
    const surcharge_over_capacity = over_capacity
      ? parseFloat(roomTypeInfo[0].surcharge_rate)
      : 0;

    const final_surcharge_rate = surcharge_guest_type + surcharge_over_capacity;
    const additional_fee = (total_room_val + total_service_val) * final_surcharge_rate;
    const total = total_room_val + total_service_val + vat_amount + additional_fee;

    res.json({
      invoice: {
        roomDetails,
        serviceDetails,
        total_room: total_room_val.toFixed(2),
        total_service: total_service_val.toFixed(2),
        vat_rate: vat_rate_val,
        vat_amount: vat_amount.toFixed(2),
        additional_fee: additional_fee.toFixed(2),
        total: total.toFixed(2)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
