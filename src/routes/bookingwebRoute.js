const express = require('express');
const router = express.Router();
const guestAuth = require('../controllers/bookingwebController');
const auth = require('../middlewares/adminAuth');

router.post('/signup', guestAuth.signup);
router.post('/signin', guestAuth.signin);
router.post('/forgot-password', guestAuth.forgotPassword);
router.post('/verify-otp', guestAuth.verifyOtp);
router.get('/profile', auth, guestAuth.profile.get);
router.put('/profile', auth, guestAuth.profile.update);
router.delete('/profile', auth, guestAuth.profile.delete);
module.exports = router;
