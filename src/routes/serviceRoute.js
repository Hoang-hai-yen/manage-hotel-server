const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/serviceController');
const auth = require('../middlewares/adminAuth');

router.use(auth);
router.get('/', roomTypeController.getServices);
router.post('/', roomTypeController.createService);
router.put('/:serviceID', roomTypeController.updateService);
router.delete('/:serviceID', roomTypeController.deleteService);

module.exports = router;