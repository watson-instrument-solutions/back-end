const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const { User } = require('../models/UserModel');
const { Booking } = require('../models/BookingModel');
const { Equipment } = require('../models/EquipmentModel')

const { authenticate } = require('../functions');


// GET route for all equipment for equipment display page visible to anyone
// localhost:3000/equipment/all
router.get('/all', async (request, response) => {
    const equipment = await Equipment.find({});
    
    if (!equipment) {
    return response.status(400).json({ message: "No equipment found" });
  }

  response.json(equipment);
});


// POST route to add new equipment for ADMIN only
// localhost:3000/equipment/add-new
router.post('/add-new', authenticate, async (request, response) => {
    // check if user is admin
    if (!request.user.admin) {
        return response.status(403).json({ message: "Unauthorized" });
      }
    //   check if equipment already exists
      const existingEquipment = await Equipment.findOne({ itemName: request.body.itemName });
      if (existingEquipment) {
        return response.status(400)
          .json({ message: "An item of equipment with this name already exists" });
      }
      
      const newEquipment = new Equipment({ 
        itemName: request.body.itemName,
        description: request.body.description,
        images: request.body.images,
        pricePerDay: request.body.pricePerDay,
        pricePerWeek: request.body.pricePerWeek,
        pricePerMonth: request.body.pricePerMonth,
        supplyCost: request.body.supplyCost,
        stock: request.body.stock,
        bookedDates: request.body.bookedDates
      });
    
      try {
        const savedEquipment = await newEquipment.save();
        response.status(201).json(savedEquipment);
      } catch (error) {
        console.error(error);
        response.status(500).json({ message: "An error occurred while trying to save the equipment" });
      };
});

module.exports = router;