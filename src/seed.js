const mongoose = require('mongoose');
const { databaseConnect } = require('./database');

databaseConnect().then(async () => {
    console.log('Seeding DB');



    const Equipment = mongoose.model('Equipment', {
        "itemName": String, 
        "description": String,
        "images": String,
        "pricePerDay": Number, 
        "pricePerWeek": Number, 
        "pricePerMonth": Number, 
        "supplyCost": Number,
        "stock": Number,
        "bookedDates": []

    })

    let newEquipment = new Equipment({
        "itemName": "NOR139",
        "description": "Environmental logger - type 1, 1/3 octave, audio, solar powered logging kit",
        "pricePerDay": 110,
        "pricePerWeek": 400,
        "pricePerMonth": 1200,
        "supplyCost": 0,
        "stock": 4,
        "bookedDates": []
    });

    await newEquipment.save().then(() => {
        console.log('Equipment Seeded');
    });

});