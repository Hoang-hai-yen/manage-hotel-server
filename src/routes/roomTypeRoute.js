const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');

router.get('/', roomTypeController.getRoomTypes);
router.post('/', roomTypeController.createRoomType);
router.put('/:roomTypeID', roomTypeController.updateRoomType);
router.delete('/:roomTypeID', roomTypeController.deleteRoomType);

module.exports = router;