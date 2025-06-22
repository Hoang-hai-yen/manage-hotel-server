const db = require('../db');

exports.getCheckInOutOverview = (req, res) => {
    const query = 
    "SELECT SUM(CASE WHEN status = 'Checked In' THEN 1 ELSE 0 END) AS total_checked_in, SUM(CASE WHEN status = 'Checked Out' THEN 1 ELSE 0 END) AS total_checked_out FROM bookings WHERE (check_in BETWEEN DATE_FORMAT(CURDATE(), '%Y-%m-01') AND CURDATE()) OR (check_out BETWEEN DATE_FORMAT(CURDATE(), '%Y-%m-01') AND CURDATE())";

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching check-in/out overview:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results[0]);
    });
}

exports.getRoomTypeStats = (req, res) => {
    const query =
    "SELECT room_type_id, COUNT(*) AS total_checked_out FROM bookings WHERE status = 'Checked Out' AND check_out BETWEEN DATE_FORMAT(CURDATE(), '%Y-%m-01') AND CURDATE() GROUP BY room_type_id";

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching room type stats:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
}

exports.getServiceStats = (req, res) => {
    const query =
    "SELECT service_id, COUNT(*) AS total_confirmed_requests FROM servicerequests WHERE status = 'Confirmed' AND created_at BETWEEN DATE_FORMAT(CURDATE(), '%Y-%m-01') AND CURDATE() GROUP BY service_id";

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching service stats:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
}

exports.getRevenueStats = (req, res) => {
    const query =
    'SELECT YEAR(b.check_out) AS year, MONTH(b.check_out) AS month, SUM(total_amount) AS total_revenue FROM invoices i JOIN bookings b ON i.booking_id = b.booking_id WHERE b.check_out BETWEEN DATE_FORMAT(CURDATE(), "%Y-%m-01") AND CURDATE() GROUP BY year, month ORDER BY year DESC, month DESC';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching revenue stats:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
}