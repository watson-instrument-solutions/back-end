// import the server package 
const express = require('express');
const app = express();

// const cors = require('cors');
// const corsOptions = {
// 	origin: "http://localhost:3000", 
// 	optionSuccessStatus: 200
// }
// app.use(cors({origin: true}));

const cors = require('cors');

const corsOptions = {
  origin: "*", // Allow requests from any origin
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

require('dotenv').config();


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