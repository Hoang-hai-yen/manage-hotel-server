const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');

router.get('/', roomTypeController.getroomtypes);
router.post('/', roomTypeController.createroomtypes);
router.put('/:roomTypeID', roomTypeController.updateroomtypes);
router.delete('/:roomTypeID', roomTypeController.deleteroomtypes);

module.exports = router;