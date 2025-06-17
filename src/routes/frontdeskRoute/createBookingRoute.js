const express = require('express');
const router = express.Router();
const frontdeskController = require('../../controllers/frontdesk/createBookingController');

router.post('/create-booking', frontdeskController.createBooking);

module.exports = router;
