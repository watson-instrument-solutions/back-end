const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: false,
        required: true
    },
    equipment: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Equipment',
            required: true
        }
    ],
    startDate: {
        type: Date,
        unique: false,
        required: true
    },
    endDate: {
        type: Date,
        unique: false,
        required: true
    },
    // bookingName: {
    //     type: String,
    //     unique: false,
    //     required: false
    // },
    totalPrice: {
        type: Number,
        unique: false,
        required: true,
        min: 0
    }
});

// Validation method for checking start date is before end date
BookingSchema.path("endDate").validate(function (value) {
    return this.startDate <= value;
  }, "End date must be after the start date.");
  
  const Booking = mongoose.model("Booking", BookingSchema);
  
  module.exports = { Booking };

