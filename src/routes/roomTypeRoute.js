const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');

router.get('/', roomTypeController.getroomtypes);
router.post('/', roomTypeController.createroomtypes);
router.put('/:room_type_id', roomTypeController.updateroomtypes);
router.delete('/:room_type_id', roomTypeController.deleteroomtypes);

module.exports = router;