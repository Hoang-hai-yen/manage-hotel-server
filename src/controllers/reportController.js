const db = require('../db');
const PDFDocument = require("pdfkit");

exports.getBookingStats = (req, res) => {
  const query = 
  "SELECT COUNT(*) AS total_bookings FROM bookings WHERE status <> 'Due In' AND check_in BETWEEN DATE_FORMAT(CURDATE(), '%Y-%m-01') AND CURDATE()"
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching booking stats:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results[0]);
  });
}

exports.getInternationalGuestStats = (req, res) => {
  const query = 
  "SELECT COUNT(*) AS international_guests FROM guests g JOIN bookings b ON g.booking_id = b.booking_id WHERE g.guest_type_id = 2 AND g.status <> 'upcoming' AND b.check_in BETWEEN DATE_FORMAT(CURDATE(), '%Y-%m-01') AND CURDATE()";

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching international guest stats:', err);
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
    'SELECT YEAR(b.check_out) AS year, MONTH(b.check_out) AS month, SUM(total_amount) AS total_revenue FROM invoices i JOIN bookings b ON i.booking_id = b.booking_id GROUP BY year, month ORDER BY year DESC, month ASC';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching revenue stats:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
}

exports.exportReportWithChart = async (req, res) => {
  try {
    const { chartBase64 } = req.body;

    // Lấy dữ liệu bookings
    const [results] = await db.promise().query(
      "SELECT booking_id, guest_fullname, check_in, check_out, status FROM bookings"
    );

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="report.pdf"');

    // 👇 Trang 1: Biểu đồ
    doc.fontSize(18).text("Hotel Report", { align: "center" });
    doc.moveDown();

    if (chartBase64) {
      const base64Data = chartBase64.replace(/^data:image\/png;base64,/, "");
      const chartBuffer = Buffer.from(base64Data, "base64");
      doc.image(chartBuffer, {
        fit: [500, 300],
        align: "center",
      });
    } else {
      doc.fontSize(12).text("No chart image provided.", {
        align: "center",
      });
    }

    doc.addPage();

    // 👇 Trang 2+: Danh sách Bookings
    doc.fontSize(16).text("Bookings Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text("ID", 50, doc.y);
    doc.text("Guest Name", 100, doc.y);
    doc.text("Check In", 300, doc.y);
    doc.text("Check Out", 410, doc.y);
    doc.text("Status", 520, doc.y);
    doc.moveDown(0.5);

    results.forEach((row) => {
      doc.text(row.booking_id, 50, doc.y);
      doc.text(row.guest_fullname, 100, doc.y);
      doc.text(new Date(row.check_in).toISOString().split("T")[0], 300, doc.y);
      doc.text(new Date(row.check_out).toISOString().split("T")[0], 410, doc.y);
      doc.text(row.status, 520, doc.y);
      doc.moveDown();
    });

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating PDF");
  }
};