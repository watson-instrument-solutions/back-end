const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const { User } = require('../models/UserModel');
const { Booking } = require('../models/BookingModel');
const { Equipment } = require('../models/EquipmentModel')

const { generateJwt, authenticate } = require('../functions');


// GET route to return all users route for admin only
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


// GET route for current user for user dashboard
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
    response.status(500).json({ message:'An error occurred while fetching user data' });
  }
});


//  POST to route CREATE a user
// localhost3000:users/register-account
router.post('/register-account', async (request, response) => 
{
    // check if user already exists by email address
    try {
      const existingUser = await User.findOne({ email: request.body.email });
      if (existingUser) {
        return response
          .status(400)
          .json({ message: "A user with this email address already exists" });
      }
    //   make sure password is at least 8 characters
      const { password } = request.body;
      if (password.length < 8) {
        return response
          .status(400)
          .json({ message: "Password should be at least 8 characters long" });
      }
      // return user with hashed password
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


//  POST route to LOG IN
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


//  PATCH route to UPDATE the current user
// localhost:3000/update-me
router.patch('/update-me', authenticate, async (request, response) => {
  try {
    const update = { ...request.body };

    let user = await User.findByIdAndUpdate(request.user._id, update, {
      new: true
    })

    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    response.json(user);
  } catch (error) {
    console.error(error);
    return response
      .status(500)
      .json({ message: "An error occurred while updating" });
  }
});

// DELETE route for current user to delete own account and any associated bookings
// localhost:3000/users/delete-me
router.delete("/delete-me", authenticate, async (request, response) => {
  try {
    // Check if the user exists
    if (!request.user || !request.user._id) {
      return response.status(400)
        .json({ message: "No account found" });
    }

    // Find all the bookings associated with the user
    const bookings = await Booking.find({ user: request.user._id });

    // Iterate through the bookings, update the equipment and delete the bookings
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
        // save the changes to the equipment
        await equipment.save(); 
      }
      // delete the booking
      await booking.deleteOne(); 
    }


    // delete the user
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

// DELETE route for admin to delete any user and associated bookings
// localhost:3000/delete/userId
router.delete("/delete/:userId", authenticate, async (request, response) => {
  if (!request.user.admin) {
    return response.status(403).json({ message: "Unauthorized" });
  }

  const userToDelete = await User.findById(request.params.userId);
  if (!userToDelete) {
    return response.status(404).json({ message: "User not found" });
  }

  // Find all the bookings associated with the user
  const bookings = await Booking.find({ user: request.params.userId });

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
        );
      });
      // save the changes to the equipment
      await equipment.save(); 
    }
    // delete the booking
    await booking.deleteOne(); 
  }
  // delete the user
  await User.findByIdAndDelete(request.params.userId);
  response.json({ message: "User deleted successfully" });
});

module.exports = router;