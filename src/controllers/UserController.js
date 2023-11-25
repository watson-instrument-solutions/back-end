const express = require('express');
const { User } = require('../models/UserModel');
const router = express.Router();
const bcrypt = require('bcryptjs');

// GET all users
router.get('/all', async (request, response) => {
    let result = await User.find({});

    response.json({
        user: result
    });
});

// GET one user by id
router.get('/one/id/:id', async (request, response) => {
    let result = null;

    response.json({
        user: result
    });
});

// GET one user by name
router.get('/one/name/:name', async (request, response) => {
    let result = null;

    response.json({
        user: result
    });
});

//  CREATE a user
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

// {
//     let result = await User.create(request.body);

//     response.json({
//         user: result
//     });
// });

//  UPDATE an existing user
router.patch('/;id', async (request, response) => {
    let result = null;

    response.json({
        user: result
    });
});

// Find user by id and delete
router.delete('/:id', async (request, response) => {
    let result = null;

    response.json({
        user: result
    });
});


module.exports = router;