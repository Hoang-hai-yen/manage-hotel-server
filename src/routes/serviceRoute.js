const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/serviceController');

router.get('/', roomTypeController.getServices);
router.post('/', roomTypeController.createService);
router.put('/:serviceID', roomTypeController.updateService);
router.delete('/:serviceID', roomTypeController.deleteService);

module.exports = router;