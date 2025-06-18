const express = require('express');
const router = express.Router();
const frontdeskController = require('../controllers/frontdesk/createBookingController');
const auth = require('../middlewares/adminAuth');

router.use(auth);
router.post('/create-booking', frontdeskController.createBooking);
router.get('/bookings', frontdeskController.getAllBookings);
router.get('/booking/:id', frontdeskController.getBookingById);
router.put('/booking/:id', frontdeskController.updateBooking);
router.delete('/booking/:id', frontdeskController.deleteBooking);
module.exports = router;
