const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');
// const auth = require('../middlewares/adminAuth');

// router.use(auth);
router.get('/', roomTypeController.getroomtypes);
router.post('/', roomTypeController.createroomtypes);
router.put('/:room_type_id', roomTypeController.updateroomtypes);
router.delete('/:room_type_id', roomTypeController.deleteroomtypes);

router.get('/:room_type_id', roomTypeController.getRoomsByRoomType);
router.post('/:room_type_id', roomTypeController.createRoomByRoomType);
router.put('/:room_type_id/:room_id', roomTypeController.updateRoomByRoomType);
router.delete('/:room_type_id/:room_id', roomTypeController.deleteRoomByRoomType);

module.exports = router;