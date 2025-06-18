const db = require('../db');

exports.getRequests = (req, res) => {
  db.query('SELECT * FROM servicerequests', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.createRequest = (req, res) => {
  const { booking_id, room_id, service_id, amount, note, } = req.body;

  // 1. Validate amount
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'amount phải > 0' });
  }

  // 2. Kiểm tra room_id có đang được book không
  const checkRoomSql = 'SELECT * FROM roomno WHERE room_id = ? AND is_booked = 0';
  db.query(checkRoomSql, [room_id], (err, roomResult) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn room_id', detail: err });
    if (roomResult.length === 0) {
      return res.status(400).json({ error: 'room_id không tồn tại hoặc chưa được đặt' });
    }

    // 3. Kiểm tra service_id tồn tại
    const checkServiceSql = 'SELECT * FROM services WHERE service_id = ?';
    db.query(checkServiceSql, [service_id], (err, serviceResult) => {
      if (err) return res.status(500).json({ error: 'Lỗi truy vấn service_id', detail: err });
      if (serviceResult.length === 0) {
        return res.status(400).json({ error: 'service_id không tồn tại' });
      }
      const insertSql = `
          INSERT INTO servicerequests (booking_id, room_id, service_id, amount, note )
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(insertSql, [booking_id, room_id, service_id, amount, note], (err, result) => {
          if (err) return res.status(500).json({ error: 'Lỗi khi thêm dịch vụ', detail: err });

          res.status(201).json({
            message: 'Tạo yêu cầu dịch vụ thành công',
            request_id: result.insertId,
            booking_id: booking_id || null,
            room_id: room_id || null,
            service_id: service_id || null,
            amount,
            note,
            status: 'Awaiting'
          });
        });
      // 4. Kiểm tra booking_id tồn tại
      /* const checkBookingSql = 'SELECT * FROM bookings WHERE booking_id = ?';
      db.query(checkBookingSql, [booking_id], (err, bookingResult) => {
        if (err) return res.status(500).json({ error: 'Lỗi truy vấn booking_id', detail: err });
        if (bookingResult.length === 0) {
          return res.status(400).json({ error: 'booking_id không tồn tại' });
        }

        // 5. Insert vào servicerequests
        const insertSql = `
          INSERT INTO servicerequests (room_id, service_id, amount, note, booking_id)
          VALUES (?, ?, ?, ?, ?)
        `;
        db.query(insertSql, [room_id, service_id, amount, note, booking_id], (err, result) => {
          if (err) return res.status(500).json({ error: 'Lỗi khi thêm dịch vụ', detail: err });

          res.status(201).json({
            message: 'Tạo yêu cầu dịch vụ thành công',
            request_id: result.insertId,
            room_id: room_id || null,
            service_id: service_id || null,
            amount,
            note,
            booking_id: booking_id || null,
            status: 'Awaiting'
          });
        });
      }); */
    });
  });
};

exports.updateRequest = (req, res) => {
  const { request_id } = req.params;
  const { amount, note, status } = req.body;

  // 1. Kiểm tra request_id tồn tại
  const checkRequestSql = 'SELECT * FROM servicerequests WHERE request_id = ?';
  db.query(checkRequestSql, [request_id], (err, requestResult) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn request_id', detail: err });
    if (requestResult.length === 0) {
      return res.status(404).json({ error: 'request_id không tồn tại' });
    }

    // 2. Cập nhật trạng thái
    const updateSql = 'UPDATE servicerequests SET amount=?, note=?, status = ? WHERE request_id = ?';
    db.query(updateSql, [amount, note, status, request_id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái', detail: err });

      res.json({
        message: 'Cập nhật yêu cầu thành công',
        request_id: result.insertId,
        amount,
        note,
        status
      });
    });
  });
}

exports.deleteRequest = (req, res) => {
  const { request_id } = req.params;
  db.query('DELETE FROM servicerequests WHERE request_id=?', [request_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Request deleted' });
  });
}