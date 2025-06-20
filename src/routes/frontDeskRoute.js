const express = require('express');
const router = express.Router();
const frontdeskController = require('../controllers/createBookingController');
// const auth = require('../middlewares/adminAuth');
const recommendedRoomsController = require('../controllers/recommendRoomsController');
const invoiceController = require('../controllers/invoiceController');

// router.use(auth);
router.get('/bookings', frontdeskController.getAllBookings);
router.get('/bookings/:id', frontdeskController.getBookingById);
router.post('/booking', frontdeskController.createBooking);
router.put('/booking/:id', frontdeskController.updateBooking);
router.delete('/booking/:id', frontdeskController.deleteBooking);
router.post('/recommended-rooms', recommendedRoomsController.getRecommendedRooms);
router.get('/invoice/:booking_id', invoiceController.getInvoiceByBookingId);

module.exports = router;
