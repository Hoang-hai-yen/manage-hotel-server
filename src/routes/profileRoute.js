const express = require('express');
const router = express.Router();
const profileController = require('../controllers/bookingWebController/profileController');
const guestAuth = require('../middlewares/guestAuth');

router.use(guestAuth);

router.get('/', profileController.getProfile);
router.put('/personal', profileController.updatePersonal);
router.put('/contact', profileController.updateContact);
router.delete('/', profileController.deleteProfile);

module.exports = router;
