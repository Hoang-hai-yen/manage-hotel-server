const express = require('express');
const router = express.Router();
const guestAuth = require('../controllers/bookingwebController');
const auth = require('../middlewares/adminAuth');

router.post('/signup', guestAuth.signup);
router.post('/signin', guestAuth.signin);
router.get('/profile', auth, guestAuth.getProfile);
router.post('/forgot-password', guestAuth.forgotPassword);
router.post('/verify-otp', guestAuth.verifyOtp);

module.exports = router;
