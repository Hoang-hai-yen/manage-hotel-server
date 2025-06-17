const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
// const auth = require('../middlewares/adminAuth');

// router.use(auth);
router.get('/', serviceController.getServices);
router.post('/', serviceController.createService);
router.put('/:service_id', serviceController.updateService);
router.delete('/:service_id', serviceController.deleteService);

module.exports = router;