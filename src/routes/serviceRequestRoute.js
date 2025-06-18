const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
// const auth = require('../middlewares/adminAuth');

// router.use(auth);
router.get('/', serviceRequestController.getRequests);
router.post('/', serviceRequestController.createRequest);
router.put('/:request_id', serviceRequestController.updateRequest);
router.delete('/:request_id', serviceRequestController.deleteRequest);

module.exports = router;