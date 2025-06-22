const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
// const auth = require('../middlewares/adminAuth');

// router.use(auth);
router.get('/CheckInOut', reportController.getCheckInOutOverview);
router.get('/RoomTypeStats', reportController.getRoomTypeStats);
router.get('/ServiceStats', reportController.getServiceStats);
router.get('/RevenueStats', reportController.getRevenueStats);

module.exports = router;