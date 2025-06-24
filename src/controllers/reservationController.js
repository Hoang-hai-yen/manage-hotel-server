require("dotenv").config();
const db = require("../db");
const nodemailer = require("nodemailer");
const { getIO } = require("../socket");
const { get } = require("./bookingWebController/otpStoreController");

exports.getReservations = (req, res) => {
    const query = "SELECT * FROM reservations ORDER BY check_in DESC";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching reservations:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
};

exports.getReservationById = (req, res) => {
    const reservationIDasNumber = parseInt(req.params.reservation_id, 10);
    if (isNaN(reservationIDasNumber)) {
        return res.status(400).json({ error: "Invalid reservation ID" });
    }
    const query = "SELECT * FROM reservations WHERE reservation_id = ?";

    db.query(query, [reservationIDasNumber], (err, results) => {
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

exports.getReservationsByGuest = (req, res) => {
    const { guest_id } = req.params;

    const query = `SELECT * FROM reservations WHERE guest_account_id = ? ORDER BY check_in DESC`;
    db.query(query, [guest_id], (err, results) => {
        if (err) {
            console.error("Error fetching reservations:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
}

exports.createReservation = async (req, res) => {
    const {
        guest_fullname,
        guest_phone,
        guest_email,
        guest_address,
        guest_type_id,
        check_in,
        check_out,
        room_type_id,
        number_of_rooms,
        adults,
        children,
        reservation_note,
    } = req.body;

    if (
        !guest_fullname ||
        !guest_phone ||
        !guest_email ||
        !guest_address ||
        !guest_type_id ||
        !check_in ||
        !check_out ||
        !number_of_rooms ||
        !room_type_id
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const totalGuests =
            parseFloat(adults) + parseFloat(children || 0) * 0.5;

        const [roomTypeRows] = await db
            .promise()
            .query(`SELECT max_guests FROM roomtypes WHERE room_type_id = ?`, [
                room_type_id,
            ]);
        if (roomTypeRows.length === 0)
            return res.status(400).json({ message: "Invalid room type" });

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
            .map((r) => r.room_id);

        const query =
            "INSERT INTO reservations (guest_fullname, guest_phone, guest_email, guest_address, guest_type_id, check_in, check_out, room_type_id, number_of_rooms, adults, children, reservation_note, recommended_rooms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [
            guest_fullname,
            guest_phone,
            guest_email,
            guest_address,
            guest_type_id,
            check_in,
            check_out,
            room_type_id,
            number_of_rooms,
            adults,
            children,
            reservation_note,
            suitableRooms.join(","),
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Error creating reservation:", err);
                return res.status(500).json({ error: "Database error" });
            }
            const bookingData = {
                reservation_id: result.insertId,
                guest_fullname,
                guest_phone,
                guest_email,
                guest_address,
                guest_type_id,
                check_in,
                check_out,
                room_type_id,
                number_of_rooms,
                adults,
                children,
                reservation_note,
            };
            getIO().emit("newReservation", bookingData);
            res.status(201).json({
                message: "Reservation created successfully",
                reservation_id: result.insertId,
                recommended_rooms: suitableRooms,
                room_type_id,
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.updateReservation = async (req, res) => {
    const { reservation_id } = req.params;
    const { reservation_note, declined_reason, assigned_room, status } =
        req.body;

    /* if (!reservation_id || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
    } */

    try {
        const query =
            "UPDATE reservations SET reservation_note=?, declined_reason=?, assigned_room=?, status=? WHERE reservation_id = ?";
        const values = [
            reservation_note,
            declined_reason,
            assigned_room,
            status,
            reservation_id,
        ];

        await db.promise().query(query, values);

        const [reservationRows] = await db
            .promise()
            .query(`SELECT * FROM reservations WHERE reservation_id = ?`, [
                reservation_id,
            ]);
        if (reservationRows.length === 0) {
            return res.status(404).json({ error: "Reservation not found" });
        }
        const reservation = reservationRows[0];
        if (status === "Confirmed") {
            let roomIDs = [];
            if (Array.isArray(assigned_room)) {
                roomIDs = assigned_room;
            } else {
                try {
                    roomIDs = JSON.parse(assigned_room);
                } catch {
                    roomIDs = [assigned_room];
                }
            }
            for (const roomID of roomIDs) {
                const queryBooking = `INSERT INTO bookings 
          (guest_fullname, guest_id_card, guest_phone, guest_email, guest_address, guest_type_id, check_in, check_out, room_id, room_type_id, adults, children, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const valuesBooking = [
                    reservation.guest_fullname,
                    reservation.guest_id_card,
                    reservation.guest_phone,
                    reservation.guest_email,
                    reservation.guest_address,
                    reservation.guest_type_id,
                    reservation.check_in,
                    reservation.check_out,
                    roomID,
                    reservation.room_type_id,
                    reservation.adults,
                    reservation.children,
                    "Due In",
                ];

                const [bookingResult] = await db
                    .promise()
                    .query(queryBooking, valuesBooking);
                const bookingId = bookingResult.insertId;

                await db
                    .promise()
                    .query(
                        `INSERT INTO room_bookings (booking_id, room_id) VALUES (?, ?)`,
                        [bookingId, roomID]
                    );

                if (roomID) {
                    await db
                        .promise()
                        .query(
                            `INSERT IGNORE INTO room_bookings (booking_id, room_id) VALUES (?, ?)`,
                            [bookingId, roomID]
                        );
                }
                await db.promise().query(
                    `INSERT INTO guests (fullname, id_card, guest_type_id, source_type, booking_id, room_id, status)
            VALUES (?, ?, ?, 'Booking', ?, ?, 'upcoming')`,
                    [
                        reservation.guest_fullname,
                        reservation.guest_id_card,
                        reservation.guest_type_id,
                        bookingId,
                        roomID || null,
                    ]
                );
            }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                },
            });
            const mailOptions = {
                from: process.env.MAIL_USER,
                to: reservation.guest_email,
                subject: "Reservation Confirmed",
                text: `Your reservation has been confirmed. Assigned room(s): ${assigned_room}`,
            };
            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    console.error("Error sending email:", error);
                    return res
                        .status(500)
                        .json({ error: "Failed to send email" });
                }
                res.json({
                    message: "Reservation updated and email sent successfully",
                });
            });
        }

        if (status === "Declined") {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                service: "gmail",
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                },
            });
            const mailOptions = {
                from: process.env.MAIL_USER,
                to: reservation.guest_email,
                subject: "Reservation Declined",
                text: `Your reservation has been declined for the following reason: ${declined_reason}`,
            };
            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    console.error("Error sending email:", error);
                    return res
                        .status(500)
                        .json({ error: "Failed to send email" });
                }
                res.json({
                    message: "Reservation updated and email sent successfully",
                });
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update reservation" });
    }
};
