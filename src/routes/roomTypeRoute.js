const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');

// --- Routes for the entire collection of room types ---
// GET /api/roomtype/
router.get('/', roomTypeController.getroomtypes);
// POST /api/roomtype/
router.post('/', roomTypeController.createroomtypes);


// --- Routes for a SINGLE room type ---
// **FIX ADDED HERE**: Handles the GET request for a specific room type's details
// GET /api/roomtype/details/RT01
router.get('/details/:room_type_id', roomTypeController.getRoomTypeById);

// Handles getting all rooms under a specific room type
// GET /api/roomtype/RT01/rooms
router.get('/:room_type_id/rooms', roomTypeController.getRoomsByRoomType);

// Handles updating a specific room type
// PUT /api/roomtype/RT01
router.put('/:room_type_id', roomTypeController.updateroomtypes);

// Handles deleting a specific room type
// DELETE /api/roomtype/RT01
router.delete('/:room_type_id', roomTypeController.deleteroomtypes);


// --- Routes for creating/updating/deleting a room under a room type ---
// POST /api/roomtype/RT01/rooms
router.post('/:room_type_id/rooms', roomTypeController.createRoomByRoomType);

// PUT /api/roomtype/RT01/rooms/A101
router.put('/:room_type_id/rooms/:room_id', roomTypeController.updateRoomByRoomType);

// DELETE /api/roomtype/RT01/rooms/A101
router.delete('/:room_type_id/rooms/:room_id', roomTypeController.deleteRoomByRoomType);


module.exports = router;