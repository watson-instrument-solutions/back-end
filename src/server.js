// import the server package 
const express = require('express');

// make an instance of the server that we can customize and run 
const app = express();

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
// Ports can only be a integer between 1001 - 65536 
// instance.routes(controllers or middleware)
// instance.use(middleware)
// instance.use(router)
// instance.get(express.json())

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const UserRouter = require('./controllers/UserController');
app.use('/users', UserRouter)

// some comment here to trigger nodemon into restarting

// GET localhost:3000/ 
// app.get(route path, callback function)
app.get("/", (request, response) => {

	response.send("Hello world, this server is bananas!");

});

module.exports = {
	app,
	HOST,
	PORT
}