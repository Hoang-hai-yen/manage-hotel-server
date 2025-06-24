const express = require('express');
const router = express.Router();

const signup = require('../controllers/bookingWebController/signupControllder');
const signin = require('../controllers/bookingWebController/signinController');
const forgotPassword = require('../controllers/bookingWebController/forgotPasswordController');
const verifyOtp = require('../controllers/bookingWebController/verifyOtpController');
const reserve = require('../controllers/reservationController');
const auth = require('../middlewares/guestAuth');

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);

router.post('/reservation', reserve.createReservation)
router.get('/:guest_id/mybookings', reserve.getReservationsByGuest);

module.exports = router;
