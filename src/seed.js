const mongoose = require('mongoose');
const { databaseConnect } = require('./database');

databaseConnect().then(async () => {
    console.log('Seeding DB');



    const Equipment = mongoose.model('Equipment', {
        "item name": String, 
        "description": String,
        "price per day": Number, 
        "price per week": Number, 
        "price per month": Number, 
        "supply cost": Number

    })

    let newEquipment = new Equipment({
        "item name": "NOR139",
        "description": "Environmental logger - type 1, 1/3 octave, audio, solar powered logging kit",
        "price per day": 110,
        "price per week": 400,
        "price per month": 1200,
        "supply cost": 0
    });

    await newEquipment.save().then(() => {
        console.log('Equipment Seeded');
    });

});