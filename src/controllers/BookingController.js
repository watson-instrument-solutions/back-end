const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const { User } = require('../models/UserModel');
const { Booking } = require('../models/BookingModel');
const { Equipment } = require('../models/EquipmentModel')

const { authenticate } = require('../functions');


// GET route to view all current bookings from all users, ADMIN only
// localhost:3000/booking/all
router.get('/all', authenticate, async (request, response) => {
    // check if user is admin
    if (!request.user.admin) {
        return response.status(403).json({ message: "Unauthorized" });
      }

    
});


// GET route to view all bookings associated with current user
// localhost:3000/booking/my-bookings
router.get('/my-bookings', authenticate, async (request, response) => {
    

    
});


// POST route to create a new booking for current user
// localhost:3000/booking/me/new
router.post('/me/new', authenticate, async (request, response) => {
    

    
});


// POST route for admin to create a new booking for any user
// localhost:3000/booking/admin/new
router.post('/admin/new', authenticate, async (request, response) => {
    

    
});


// PATCH route for admin to update any booking
// localhost:3000/booking/admin/update
router.patch('/admin/update', authenticate, async (request, response) => {
    // check if user is admin
    if (!request.user.admin) {
        return response.status(403).json({ message: "Unauthorized" });
      }

    
});


// DELETE route for admin to delete any booking
// localhost:3000/booking/admin/update
router.patch('/admin/delete', authenticate, async (request, response) => {
    // check if user is admin
    if (!request.user.admin) {
        return response.status(403).json({ message: "Unauthorized" });
      }

    
});


// DELETE route for current user to delete their booking
// localhost:3000/booking/admin/update
router.patch('/me/delete', authenticate, async (request, response) => {
    

    
});


module.exports = router;