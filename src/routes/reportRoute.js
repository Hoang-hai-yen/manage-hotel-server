const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
// const auth = require('../middlewares/adminAuth');

// router.use(auth);
router.get('/BookingStats', reportController.getBookingStats);
router.get('/InternationalGuestStats', reportController.getInternationalGuestStats);
router.get('/RoomTypeStats', reportController.getRoomTypeStats);
router.get('/ServiceStats', reportController.getServiceStats);
router.get('/RevenueStats', reportController.getRevenueStats);
router.post('/export', reportController.exportReportWithChart);

module.exports = router;