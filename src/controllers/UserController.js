const express = require('express');
const { User } = require('../models/UserModel')
const router = express.Router();

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
// localhost3000:users/
router.post('/', async (request, response) => {
    let result = await User.create(request.body);

    response.json({
        user: result
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