const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// GET all reservations
router.get('/', reservationController.getReservations);

// POST a new reservation
// FIX: Added the missing POST route to handle reservation creation.
router.post('/', reservationController.createReservation);

// GET a single reservation by its ID
router.get('/:reservation_id', reservationController.getReservationById);

// PUT (update) a reservation by its ID
router.put('/:reservation_id', reservationController.updateReservation);

module.exports = router;
