const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
// const auth = require('../middlewares/adminAuth');

// router.use(auth);
router.get('/', guestController.getGuests);

module.exports = router;