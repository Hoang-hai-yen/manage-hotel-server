const express = require('express');
const router = express.Router();
const guestTypeController = require('../controllers/guestTypeController');

router.get('/', guestTypeController.getGuestTypes);
router.post('/', guestTypeController.createGuestType);
router.put('/:guest_type_id', guestTypeController.updateGuestType);
router.delete('/:guest_type_id', guestTypeController.deleteGuestType);

module.exports = router;