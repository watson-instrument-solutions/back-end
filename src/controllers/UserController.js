const express = require('express');
const { User } = require('../models/UserModel');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateJwt, authenticate } = require('../functions');


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
      return res.status(400).json({ message: "User not found" });
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

// Find user by id and delete
router.delete('/:id', async (request, response) => {
    let result = null;

    response.json({
        user: result
    });
});


module.exports = router;