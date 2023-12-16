const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EquipmentSchema = new Schema({
    itemName: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        unique: false,
        required: false
    },
    images: {
        type: String,
        unique: false,
        required: false
    },
    pricePerDay: {
        type: Number,
        unique: false,
        required: true
    },
    pricePerWeek: {
        type: Number,
        unique: false,
        required: true
    },
    pricePerMonth: {
        type: Number,
        unique: false,
        required: true
    },
    supplyCost: {
        type: Number,
        unique: false,
        required: false
    },
    stock: {
        type: Number,
        unique: false,
        required: true
    },
    bookedDates: [
        {
            startDate: {
                type: Date
            },
            endDate: {
                type: Date
            }, 
            remainingStock: {
                type: Number
            }
        },
    ]
});

// Add a method to remove bookedDates from the array
EquipmentSchema.methods.removeBookedDates = async function (startDate, endDate) {
    this.bookedDates = this.bookedDates.filter((booking) => {
      const bookingStartDate = new Date(booking.startDate).getTime()
      const bookingEndDate = new Date(booking.endDate).getTime()
      const targetStartDate = new Date(startDate).getTime()
      const targetEndDate = new Date(endDate).getTime()
  
      // Keep only the bookedDates that don't match the deleted booking
      return !(
        bookingStartDate === targetStartDate && bookingEndDate === targetEndDate
      )
    })
    await this.save() // save the changes after removing the dates
  }

  const Equipment = mongoose.model('Equipment', EquipmentSchema)

module.exports = { Equipment }