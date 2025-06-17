const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/serviceController');
const auth = require('../middlewares/adminAuth');

router.use(auth);
router.get('/', roomTypeController.getServices);
router.post('/', roomTypeController.createService);
router.put('/:service_id', roomTypeController.updateService);
router.delete('/:service_id', roomTypeController.deleteService);

module.exports = router;