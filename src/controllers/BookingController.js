const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

const { User } = require('../models/UserModel');
const { Booking } = require('../models/BookingModel');
const { Equipment } = require('../models/EquipmentModel')

const { authenticate } = require('../functions');


// Total price calculation used in createBooking()
async function calculateTotalPrice(...args) {
  try {
	let equipment, start, end;

    // Check if the first argument is an object (booking)
    if (args[0] && typeof args[0] === 'object') {
      // Extract values from the booking object
      const { equipment: equipmentID, startDate, endDate } = args[0];
      equipment = await Equipment.findById(equipmentID);
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Extract values from individual arguments
      const [equipmentID, startDate, endDate] = args;
      equipment = await Equipment.findById(equipmentID);
      start = new Date(startDate);
      end = new Date(endDate);
    }

    if (!equipment) {
      throw new Error("Equipment not found");
    }

    // One day in ms
    const oneDay = 24 * 60 * 60 * 1000; 
    // One week in ms
    const oneWeek = oneDay * 7;
    // One month in ms
	// if customer books for the month of feb in a non leap year, code to switch to month rate?
    const oneMonth = oneDay * 29;
    // Calculate the number of days/weeks/months between startDate and endDate
    const days = Math.floor(Math.abs((end - start) / oneDay));
    const weeks = Math.floor(Math.abs((end - start) / oneWeek));
    const months = Math.floor(Math.abs((end - start) / oneMonth));

    // calculate total price based on relevant rate
    let totalPrice = 0 + equipment.supplyCost;
    if (days < 7) {
      totalPrice = days * equipment.pricePerDay;
    } else if (days >= 7 && days < 29) {
      totalPrice = weeks * equipment.pricePerWeek;
    } else {
      totalPrice = months * equipment.pricePerMonth;
    }

	// If a booking object is provided, update its total price
    if (args[0] && typeof args[0] === 'object') {
		const booking = args[0];
		booking.totalPrice = totalPrice;
  
		// Save the updated booking to the database 
		await booking.save();
	}
    return totalPrice;

  } catch (error) {
    throw new Error("Error calculating total price");
  }
}


// function to generate a booking
async function createBooking(equipmentID, startDate, endDate, request) {
	try {
	  // Check if equipmentID is valid
	  console.log("Received equipmentID:", equipmentID);
	  if (!mongoose.Types.ObjectId.isValid(equipmentID)) {
		throw new Error("Invalid equipment ID");
	  }
  
	  // Retrieve userID from the token
	  const userID = request.user._id;
  
	  // Convert startDate and endDate to Date objects
	  const start = new Date(startDate);
	  const end = new Date(endDate);
  
	  // Validate dates
	  if (start > end) {
		throw new Error("End date must be after the start date");
	  }
  
	  // Create a new Date object representing the current date and time.
	  const currentDate = new Date();
  
	  // Check if either the 'start' or 'end' date is in the past compared to the current date.
	  if (start < currentDate || end < currentDate) {
		// If any of the booking dates are in the past, throw an error.
		throw new Error("Booking dates after todays date");
	  }
  
	  // Check if the equipment exists
	  const equipmentExists = await Equipment.exists({ _id: equipmentID });
	  if (!equipmentExists) {
		throw new Error("The specified equipment does not exist");
	  }
  
	  // Check if the user exists
	  const userExists = await User.exists({ _id: userID });
	  if (!userExists) {
		throw new Error("The specified user does not exist");
	  }
  
	  // Check if the equipment is available for the given dates
	  const equipment = await Equipment.findById(equipmentID);
	  if (!equipment) {
		throw new Error("The specified equipment does not exist");
	  }
  
	  // Calculate the total price for the booking
	  const totalPrice = await calculateTotalPrice(equipmentID, startDate, endDate);
  
	  // Create a new 'Booking' object with the provided details.
	  const booking = new Booking({
		user: userID, // Set the user ID obtained from the token.
		equipment: equipmentID, // Set the equipment ID for the booking.
		startDate: startDate, // Set the start date of the booking.
		endDate: endDate, // Set the end date of the booking.
		totalPrice: totalPrice, // Set the total price for the booking.
	  });
  
	  // Check if the equipment is available for the specified booking dates.
	  const isAvailable = equipment.bookedDates.every((booking) => {
		// Convert each booked date from the equipments bookedDates array to Date objects.
		const bookedStart = new Date(booking.startDate);
		const bookedEnd = new Date(booking.endDate);
  
		// Convert the new booking start and end dates to Date objects.
		const newStart = new Date(startDate);
		const newEnd = new Date(endDate);
		
		// Check if stock level is available
		const isStock = equipment.stock;
		if (!isStock) {
			console.log('No stock available for this booking period');
		};

		// Return true if the new booking's start date is after the booked end date
		// OR if the new booking's end date is before the booked start date,
		// AND the stock level is greater than 1
		return newStart > bookedEnd || newEnd < bookedStart && isStock >= 1;
	  });
  
	  if (!isAvailable) {
		throw new Error("The equipment is not available for the selected dates");
	  }

	  // Update the equipment stock and bookedDates field with the new booking
		const updatedStock = equipment.stock - 1; // Decrement stock by 1
		if (updatedStock < 0) {
    	throw new Error("Not enough stock available for the equipment");
		}

		equipment.stock = updatedStock;
  
	  // Update the equipment bookedDates field with the new booking
	  equipment.bookedDates.push({ startDate, endDate });
	  await equipment.save();
  
	  await booking.save();
	  return booking;
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
  const { equipmentID, startDate, endDate } = request.body;
  try {
    const newBooking = await createBooking(equipmentID, startDate, endDate, request);
    response.json(newBooking)
  } catch(error) {
    response.status(400).json({ messgae: error.message });
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
			totalPrice: existingBooking.totalPrice, // Use the existing total price initially
		  };
	  
		  // Create a new booking with the updated data
		  const updatedBooking = await Booking.findByIdAndUpdate(
			request.params.id,
			updatedBookingData,
			{ new: true }
		  );
	  
		  // Recalculate total price if start or end date has changed
		  if (
			request.body.startDate !== existingBooking.startDate ||
			request.body.endDate !== existingBooking.endDate
		  ) {
			await calculateTotalPrice(updatedBooking);
		  }
	
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
  
	const equipmentId = booking.equipment;
	const equipment = await Equipment.findById(equipmentId);
  
	if (!equipment) {
	  return response.status(404).json({ error: "Equipment not found" });
	}
  
	// Remove the bookedDates associated with the booking from the equipment
	equipment.bookedDates = equipment.bookedDates.filter((bookedDate) => {
	  return !(
		bookedDate.startDate.getTime() ===
		  new Date(booking.startDate).getTime() &&
		bookedDate.endDate.getTime() === new Date(booking.endDate).getTime()
	  );
	});

	// update the stock value to the equipment
	equipment.stock += 1;
  
	await equipment.save(); // save the changes to the equipment
  
	await booking.deleteOne();
	response.json({ message: `Booking ${request.params.id} deleted successfully` });
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