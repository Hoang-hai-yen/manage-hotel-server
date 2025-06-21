const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.get('/', reservationController.getReservations);
router.get('/:reservation_id', reservationController.getReservationById);
router.put('/:reservation_id', reservationController.updateReservation);

module.exports = router;