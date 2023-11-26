const express = require('express');
const { User } = require('../models/UserModel');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateJwt, authenticate } = require('../functions');
const { Booking } = require('../models/BookingModel');
const { Equipment } = require('../models/EquipmentModel')



// GET all users route for admin only
// localhost:3000/users/all
router.get('/all', authenticate, async (request, response) => {
  if (!request.user.admin) {
    return response.status(403).json({ message: 'Unauthorised' });
  }  
  
  let result = await User.find({});
  if (!result) {
    return response.status(400).json({ message:'No users found' });
  }

    response.json({
        user: result
    });
});


// GET current user for dashboard
// localhost:3000/users/me
router.get('/me', authenticate, async (request, response) => {
  try {
    const user = await User.findOne({ _id: request.user._id });
    if (!user) {
      return response.status(404).json({ message: "No user found" });
    }
    response.json(user);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message:'An erro occured while fetching user data' });
  }
});


//  POST to CREATE a user
// localhost3000:users/register-account
router.post('/register-account', async (request, response) => 
{
    // check if user already exists by email address
    try {
      const existingUser = await User.findOne({ email: request.body.email });
      if (existingUser) {
        return response
          .status(400)
          .json({ message: "A user with this email already exists" });
      }
    //   make sure password is at least 8 characters
      const { password } = request.body;
      if (password.length < 8) {
        return response
          .status(400)
          .json({ message: "Password should be at least 8 characters long" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = new User({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        businessName: request.body.businessName,
        telephone: request.body.telephone,
        email: request.body.email,
        password: hashedPassword,
        address: request.body.address,
        admin: request.body.admin,
        
      });
  
      const savedUser = await user.save();
      response.json(savedUser);

    } catch (error) {
      console.error(error);
      response
        .status(500)
        .json({ message: "An error occurred while creating the account." });
    }
  });


//  POST to LOG IN
// localhost3000:users/login
  router.post("/login", async (request, response) => {
    const user = await User.findOne({ email: request.body.email });
    if (!user) {
      return response.status(400).json({ message: "User not found" });
    }
  
    const pwMatch = await bcrypt.compare(request.body.password, user.password);
    if (!pwMatch) {
      return response.status(400).json({ message: "Incorrect password" });
    }
  
    let freshJwt = generateJwt(user._id.toString());

	  // respond with the JWT 
	    response.json({
		    jwt: freshJwt
	  });
  });


//  UPDATE an existing user
router.patch('/;id', async (request, response) => {
    let result = null;

    response.json({
        user: result
    });
});

// Delete route for current use
// localhost:3000/users/deleteme
router.delete("/delete-me", authenticate, async (request, response) => {
  try {
    // Check if the user exists
    if (!request.user || !request.user._id) {
      return response.status(400)
        .json({ message: "No account found" });
    }

    // Find all the bookings associated with the user
    const bookings = await Booking.find({ user: request.user._id });

    // Iterate through the bookings and update the equipment and delete the bookings
    for (const booking of bookings) {
      const equipmentId = booking.equipment;
      const equipment = await Equipment.findById(equipmentId);

      if (equipment) {
        // Remove the bookedDates associated with the booking from the equipment
        equipment.bookedDates = equipment.bookedDates.filter((bookedDate) => {
          return !(
            bookedDate.startDate.getTime() ===
              new Date(booking.startDate).getTime() &&
            bookedDate.endDate.getTime() === new Date(booking.endDate).getTime()
          )
        });

        await equipment.save(); // save the changes to the equipment
      }

      await booking.deleteOne(); // delete the booking
    }


    // Attempt to delete the user
    const user = await User.findByIdAndDelete(request.user._id);

    // Check if the user was deleted successfully
    if (!user) {
      return response.status(400)
        .json({ message: "User not found or could not be deleted" });
    }

    response.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    response.status(500)
      .json({ message: "An error occurred while trying to delete account" });
  }
});


module.exports = router;