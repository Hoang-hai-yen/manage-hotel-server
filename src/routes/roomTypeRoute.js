const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');

router.get('/roomType', roomTypeController.getRoomTypes);
router.post('/roomType', roomTypeController.createRoomType);
router.put('/roomType/:roomTypeID', roomTypeController.updateRoomType);
router.delete('/roomType/:roomTypeID', roomTypeController.deleteRoomType);

module.exports = router;