// import the server package 
const express = require('express');
const app = express();

// import cors
const cors = require('cors');

// set cors to allow access from any origin
const corsOptions = {
  origin: "*", 
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// import dotenv
require('dotenv').config();


const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({extended: true}));

const UserRouter = require('./controllers/UserController');
app.use('/users', UserRouter);

const EquipmentRouter = require('./controllers/EquipmentController');
app.use('/equipment', EquipmentRouter);

const BookingRouter = require('./controllers/BookingController');
app.use('/booking', BookingRouter);


// test message to see the api is running
app.get("/", (request, response) => {

	response.send("Hello world, this server is hello!");

});

module.exports = {
	app,
	HOST,
	PORT
}