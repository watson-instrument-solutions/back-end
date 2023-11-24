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
    pricePerDay: {
        type: Number,
        unique: false,
        required: false
    },
    pricePerWeek: {
        type: Number,
        unique: false,
        required: false
    },
    pricePerMonth: {
        type: Number,
        unique: false,
        required: false
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
  
//   // Validation for bookedDates
//   EquipmentSchema.path('bookedDates').validate(function (bookedDates) {
//     // Check if all bookedDates have valid startDate and endDate
//     for (const booking of bookedDates) {
//       if (!booking.startDate || !booking.endDate) {
//         return false
//       }
//     }

    
//   };

  const Equipment = mongoose.model('Equipment', EquipmentSchema)

module.exports = { Equipment }