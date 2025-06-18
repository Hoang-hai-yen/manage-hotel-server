const express = require('express');
const router = express.Router();
const frontdeskController = require('../controllers/frontdesk/createBookingController');
// const auth = require('../middlewares/adminAuth');

// router.use(auth);
router.get('/bookings', frontdeskController.getAllBookings);
router.get('/bookings/:id', frontdeskController.getBookingById);
router.post('/booking', frontdeskController.createBooking);
router.put('/booking/:id', frontdeskController.updateBooking);
router.delete('/booking/:id', frontdeskController.deleteBooking);
module.exports = router;
