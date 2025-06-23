require("dotenv").config();
const db = require("../db");
const nodemailer = require("nodemailer");
const { getIO } = require("../socket");
const { get } = require("./bookingWebController/otpStoreController");

exports.getReservations = (req, res) => {
    const query = 'SELECT * FROM reservations ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching reservations:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
};

exports.getReservationById = (req, res) => {
    // Convert the URL parameter from a string to an integer
    const reservationIdAsInt = parseInt(req.params.reservation_id, 10);

    // Check if the conversion was successful
    if (isNaN(reservationIdAsInt)) {
        return res.status(400).json({ error: 'Invalid reservation ID.' });
    }

    const query = 'SELECT * FROM reservations WHERE reservation_id = ?';
    
    // Use the converted integer in the query
    db.query(query, [reservationIdAsInt], (err, results) => {
        if (err) {
            console.error("Error fetching reservation:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Reservation not found" });
        }
        res.json(results[0]);
    });
};

exports.createReservation = async (req, res) => {
    const { guest_fullname, guest_phone, guest_email, guest_address, guest_type_id, check_in, check_out, room_type_id, number_of_rooms, adults, children, reservation_note, payment_method, status, assigned_room } = req.body;

    if (
        !guest_fullname ||
        !guest_phone ||
        !guest_email ||
        !check_in ||
        !check_out ||
        !number_of_rooms ||
        !room_type_id
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const query = 'INSERT INTO reservations (guest_fullname, guest_phone, guest_email, guest_address, guest_type_id, check_in, check_out, room_type_id, number_of_rooms, adults, children, payment_method, status, reservation_note, assigned_room) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [guest_fullname, guest_phone, guest_email, guest_address, guest_type_id, check_in, check_out, room_type_id, number_of_rooms, adults, children, payment_method, status, reservation_note, assigned_room];

        const [result] = await db.promise().query(query, values);
        res.status(201).json({ message: 'Reservation created successfully', reservation_id: result.insertId });

    } catch (err) {
        console.error('Error creating reservation:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

exports.updateReservation = async (req, res) => {
    const { reservation_id } = req.params;
    // SỬA LỖI: Lấy tất cả các trường dữ liệu cần thiết từ body của request
    const { 
        reservation_note, 
        declined_reason, 
        assigned_room, 
        status,
        room_type_id,
        payment_method
        // Thêm các trường khác từ req.body nếu bạn muốn cho phép chỉnh sửa chúng
    } = req.body;

    try {
        // SỬA LỖI: Cập nhật tất cả các trường cần thiết trong câu lệnh UPDATE
        const updateQuery = `
            UPDATE reservations SET 
                reservation_note = ?, 
                declined_reason = ?, 
                assigned_room = ?, 
                status = ?,
                room_type_id = ?,
                payment_method = ?
            WHERE reservation_id = ?
        `;
        const updateValues = [
            reservation_note, 
            declined_reason, 
            assigned_room, 
            status, 
            room_type_id,
            payment_method,
            reservation_id
        ];
        await db.promise().query(updateQuery, updateValues);

        // Logic tạo booking khi 'Confirmed' vẫn được giữ nguyên
        if (status === 'Confirmed' && assigned_room) {
    // Check if a booking for this reservation already exists
    const [existingBooking] = await db.promise().query(
        'SELECT * FROM bookings WHERE reservation_id = ?',
        [reservation_id]
    );

    const [reservationRows] = await db.promise().query('SELECT * FROM reservations WHERE reservation_id = ?', [reservation_id]);
    if (reservationRows.length === 0) {
        return res.status(404).json({ error: 'Reservation not found after update.' });
    }
    const reservation = reservationRows[0];
    
    const [roomTypeRows] = await db.promise().query('SELECT price_room FROM roomtypes WHERE room_type_id = ?', [reservation.room_type_id]);
    const nightly_rate = roomTypeRows.length > 0 ? roomTypeRows[0].price_room : 0;

    if (existingBooking.length > 0) {
        // --- BOOKING EXISTS, SO UPDATE IT ---
        const bookingId = existingBooking[0].booking_id;
        const updateBookingQuery = `
            UPDATE bookings SET 
                guest_fullname = ?, guest_id_card = ?, guest_phone = ?, guest_email = ?, guest_address = ?, guest_type_id = ?, 
                check_in = ?, check_out = ?, room_id = ?, room_type_id = ?, adults = ?, children = ?, nightly_rate = ?, payment_method = ?, status = ?
            WHERE booking_id = ?
            `;
            const updateBookingValues = [
                reservation.guest_fullname, reservation.guest_id_card, reservation.guest_phone, reservation.guest_email, reservation.guest_address, reservation.guest_type_id,
                reservation.check_in, reservation.check_out, assigned_room, reservation.room_type_id, reservation.adults, reservation.children,
                nightly_rate, reservation.payment_method, bookingId
            ];
            await db.promise().query(updateBookingQuery, updateBookingValues);

        } else {
            // --- BOOKING DOES NOT EXIST, SO INSERT IT ---
            const insertBookingQuery = `
                INSERT INTO bookings (reservation_id, guest_fullname, guest_id_card, guest_phone, guest_email, guest_address, guest_type_id, check_in, check_out, room_id, room_type_id, adults, children, nightly_rate, payment_method, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Due In')
            `;
            const insertBookingValues = [
                reservation_id, reservation.guest_fullname, reservation.guest_id_card, reservation.guest_phone, reservation.guest_email, reservation.guest_address, reservation.guest_type_id,
                reservation.check_in, reservation.check_out, assigned_room, reservation.room_type_id, reservation.adults, reservation.children,
                nightly_rate, reservation.payment_method
            ];

            const [bookingResult] = await db.promise().query(insertBookingQuery, insertBookingValues);
            const bookingId = bookingResult.insertId;

            // Create related records for the new booking
            await db.promise().query(`INSERT INTO room_bookings (booking_id, room_id) VALUES (?, ?)`, [bookingId, assigned_room]);
            await db.promise().query(`INSERT INTO guests (fullname, id_card, guest_type_id, source_type, booking_id, room_id, status) VALUES (?, ?, ?, 'Booking', ?, ?, 'upcoming')`, [reservation.guest_fullname, reservation.guest_id_card, reservation.guest_type_id, bookingId, assigned_room]);
        }
}

        res.json({ message: 'Reservation updated successfully.' });

    } catch (err) {
        console.error('Error updating reservation:', err);
        res.status(500).json({ error: 'Failed to update reservation', details: err.message });
    }
}
