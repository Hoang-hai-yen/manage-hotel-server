const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController/manageController');

router.post('/signin', authController.login);

module.exports = router;
