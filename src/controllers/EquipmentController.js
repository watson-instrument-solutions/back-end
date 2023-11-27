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
    if (!request.user.admin) {
        return response.status(403).json({ message: "Unauthorized" });
      }
    
      const { itemName, pricePerDay, pricePerWeek, pricePerMonth, stock } = request.body;
      if (
        !itemName || typeof itemName !== "string" ||
        !pricePerDay || typeof pricePerDay !== "number" ||
        !pricePerWeek || typeof pricePerWeek !== "number" ||
        !pricePerMonth || pricePerMonth !== "number" ||
        !stock || stock !== "number"
      ) {
        return response.status(400).json({
          message:
            "Missing itemName or pricePerDay/Week/Month or stock in the request body. itemName must be a string and all other fields must be a number > 0.",
        });
      }
    
      const newEquipment = new Equipment({ itemName, pricePerDay, pricePerWeek, pricePerMonth, stock });
    
      try {
        const savedEquipment = await newEquipment.save();
        response.status(201).json(savedEquipment);
      } catch (error) {
        console.error(error);
        response.status(500).json({ message: "An error occurred while trying to save the equipment" });
      };
});