const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

const { User } = require('../models/UserModel');
const { Booking } = require('../models/BookingModel');
const { Equipment } = require('../models/EquipmentModel')

const { authenticate } = require('../functions');

// function to generate a booking
async function createBooking(equipmentIDs, startDate, endDate, totalPrice, request) {
	try {
	  // Validate equipmentIDs
	  for (const equipmentID of equipmentIDs) {
		if (!mongoose.Types.ObjectId.isValid(equipmentID)) {
		  throw new Error("Invalid equipment ID");
		}
	  }
  
	  // Retrieve user ID from the token
	  const userID = request.user._id;
  
	  // Convert startDate and endDate to Date objects
	  const start = new Date(startDate);
	  const end = new Date(endDate);
  
	  // Validate dates
	  if (start > end) {
		throw new Error("End date must be after the start date");
	  }
  
	  // Check if equipment exists
	  const equipmentObjects = await Equipment.find({ _id: { $in: equipmentIDs } });
	//   if (equipmentObjects.length !== equipmentIDs.length) {
	// 	throw new Error("One or more specified equipment do not exist");
	//   }
  
	  // Check if the user exists
	  const userExists = await User.exists({ _id: userID });
	  if (!userExists) {
		throw new Error("The specified user does not exist");
	  }
  
	  // Calculate total price for the booking
	//   const totalPrice = await calculateTotalPrice(equipmentObjects, startDate, endDate);
  
	  // Create a new 'Booking' object
	  const booking = new Booking({
		user: userID,
		equipment: equipmentIDs,
		startDate: startDate,
		endDate: endDate,
		totalPrice: totalPrice,
	  });
  
	  // Log initial state of equipmentObjects
	  console.log("Initial equipmentObjects:", equipmentObjects);
  
	  // Update stock and bookedDates for each equipment
	  for (const equipment of equipmentObjects) {
		// Update stock and bookedDates for each equipment
		equipment.stock -= 1;
		equipment.bookedDates.push({ startDate, endDate });
		await equipment.save();
	  }
  
	  // Log final state of equipmentObjects
	  console.log("Final equipmentObjects:", equipmentObjects);
  
	  // Save the booking
	  await booking.save();
  
	  return {
		message: "Booking created successfully",
		booking: booking,
	  };
	} catch (error) {
	  throw new Error("Error creating booking: " + error.message);
	}
  }


// GET route to view all current bookings from all users, ADMIN only
// localhost:3000/booking/all
router.get('/all', authenticate, async (request, response) => {
    // check if user is admin
    if (!request.user.admin) {
        return response.status(403).json({ message: "Unauthorized" });
      }
	
    const bookings = await Booking.find({});
    if (!bookings) {
      return response.status(404).json({ message: 'No bookings found' });
    }

    response.json(bookings);
});


// GET route to view all bookings associated with current user
// localhost:3000/booking/my-bookings
router.get('/my-bookings', authenticate, async (request, response) => {
   
  try {
    const bookings = await Booking.find({ user: request.user._id });
    response.json(bookings)

  } catch(error) {
    console.error('An error occurred while fetching your bookings', error)
    response.status(500).json({ message: 'An error occurred whilst fetching bookings'})
  }
    
});


// POST route to create a new booking for current user
// localhost:3000/booking/me/new
router.post('/me/new', authenticate, async (request, response) => {
  const { equipmentIDs, startDate, endDate, totalPrice } = request.body;
//   console.log("Request object-router:", request);
  try {
    const newBooking = await createBooking(equipmentIDs, startDate, endDate, totalPrice, request);
	
    response.json(newBooking)
  } catch(error) {
    response.status(400).json({ message: error.message });
  }

});


// PATCH route for admin to update any booking
// localhost:3000/booking/admin/update
router.patch('/admin/update/:id', authenticate, async (request, response) => {
    // check if user is admin
    if (!request.user.admin) {
        return response.status(403).json({ message: "Unauthorized" });
      }

	  try {

		const existingBooking = await Booking.findById(request.params.id);

    	if (!existingBooking) {
      		return response.status(404).json({ message: "Booking not found" });
    	}

		// Create a separate variable with the updated dates
		const updatedBookingData = {
			user: request.body.user,
			equipment: request.body.equipment,
			startDate: request.body.startDate,
			endDate: request.body.endDate,
			totalPrice: request.body.totalPrice,
		  };
	  
		  // Create a new booking with the updated data
		  const updatedBooking = await Booking.findByIdAndUpdate(
			request.params.id,
			updatedBookingData,
			{ new: true }
		  );
	
		response.json(updatedBooking);
	  } catch (error) {
		console.error(error);
		response.status(500).json({ message: "An error occurred while trying to update the booking" });
	  }
    
});

// DELETE route for user to delete their own booking
// localhost:3000/booking/delete/id
router.delete("/delete/:id", authenticate, async (request, response) => {
	const booking = await Booking.findOne({
	  _id: request.params.id,
	  user: request.user._id,
	});
  
	if (!booking) {
	  return response
		.status(404)
		.json({ message: `Booking ${request.params.id} not found` });
	}
  
	const equipmentIds = booking.equipment;
	const equipmentArray = await Equipment.find({ _id: { $in: equipmentIds } });
  
	if (equipmentArray.length === 0) {
	  return response.status(404).json({ error: "Equipment not found" });
	}
  
	// Loop through each equipment object
	for (const equipment of equipmentArray) {
	  // Remove the bookedDates associated with the booking from the equipment
	  equipment.bookedDates = equipment.bookedDates.filter((bookedDate) => {
		return !(
		  bookedDate.startDate.getTime() ===
			new Date(booking.startDate).getTime() &&
		  bookedDate.endDate.getTime() === new Date(booking.endDate).getTime()
		);
	  });
  
	  // Update the stock value for the equipment
	  equipment.stock += 1;
  
	  // Save the changes to the equipment
	  await equipment.save();
	}
  
	// Delete the booking
	await booking.deleteOne();
	response.json({
	  message: `Booking ${request.params.id} deleted successfully`,
	});
  });

// DELETE route for admin to delete any booking
// localhost:3000/booking/admin/delete/id
router.delete('/admin/delete/:id', authenticate, async (request, response) => {
    // check if user is admin
    if (!request.user.admin) {
        return response.status(403).json({ message: "Unauthorized" });
      }
	  try {
		const bookingToDelete = await Booking.findById(request.params.id);
	
		if (!bookingToDelete) {
		  return response.status(404).json({ message: "Booking not found"})
		}

		equipmentID = bookingToDelete.equipment;
		equipment = await Equipment.findById(equipmentID)
	  
		// Update the equipment stock field 
		const updatedStock = equipment.stock + 1 // Increment stock by 1
		if (updatedStock === equipment.stock) {
    	throw new Error("error recalculating equipment stock");
		}

		equipment.stock = updatedStock;
		await equipment.save();

		// Remove the bookedDates associated with the booking from the equipment
		equipment.bookedDates = equipment.bookedDates.filter((bookedDate) => {
			return !(
			  bookedDate.startDate.getTime() === new Date(bookingToDelete.startDate).getTime() &&
			  bookedDate.endDate.getTime() === new Date(bookingToDelete.endDate).getTime()
			);
		  });

		
		await equipment.save();
	
		// delete the booking
		await Booking.findByIdAndDelete( request.params.id );
	
		response.json({ message: 'Booking has been deleted successfully'});
	
	  } catch(error) {
		console.error(error);
		response.status(500).json({message: 'An error ocurred whilst trying to delete booking'});
	  }
    
});




module.exports = router;