const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { databaseConnect } = require('./database');

// Number of rounds to perform for bcrypt hashing
const saltRounds = 10;


async function hashPassword(password) {
    return await bcrypt.hash(password, saltRounds);
  }

databaseConnect().then(async () => {
    console.log('Seeding DB');

    const { User } = require('./models/UserModel');
    const { Equipment } = require('./models/EquipmentModel');

    // Equipment items

    let nOR139 = new Equipment({
        "itemName": "NOR139",
        "description": "Environmental logger - type 1, 1/3 octave, audio, solar powered logging kit",
        "images": "https://i.postimg.cc/k5fmrnVQ/nor139.jpg",
        "pricePerDay": 110,
        "pricePerWeek": 400,
        "pricePerMonth": 1200,
        "supplyCost": 0,
        "stock": 5,
        "bookedDates": []
    });

    await nOR139.save().then(() => {
        console.log('NOR139 Seeded');
    });

    let bSWA309 = new Equipment({
        "itemName": "BSWA309", 
        "description": "Environmental logger - type 2, solar powered logging kit",
        "images": "https://i.postimg.cc/FR6XRDV1/bswa309.jpg",
        "pricePerDay": 55, 
        "pricePerWeek": 250, 
        "pricePerMonth": 750, 
        "supplyCost": 0,
        "stock": 2,
        "bookedDates": []

    });

    await bSWA309.save().then(() => {
        console.log('BSWA309 Seeded');
    });

    let fieldCalibrator = new Equipment({
        "itemName": "Field Calibrator", 
        "description": "ARL RD9 type 1, B&K 4230 type 2",
        "images": "https://i.postimg.cc/s2Vr0B2f/B-K-4230-WW836-1.jpg",
        "pricePerDay": 30, 
        "pricePerWeek": 130, 
        "pricePerMonth": 390, 
        "supplyCost": 0,
        "stock": 3,
        "bookedDates": []

    });

    await fieldCalibrator.save().then(() => {
        console.log('Field Calibrator Seeded');
    });

    let altoTS315 = new Equipment({
        "itemName": "Alto TS315", 
        "description": "15in 2000W PA Loudspeaker",
        "images": "https://i.postimg.cc/jC0V629b/L00737000000000-00-1600x1600.jpg",
        "pricePerDay": 60, 
        "pricePerWeek": 200, 
        "pricePerMonth": 500, 
        "supplyCost": 0,
        "stock": 1,
        "bookedDates": []

    });

    await altoTS315.save().then(() => {
        console.log('Alto 315 Seeded');
    });

    let davis = new Equipment({
        "itemName": "Davis Vantage Vue", 
        "description": "Portable Weather Station",
        "images": "https://i.postimg.cc/MTH8qhRh/Davis-vue-1.jpg",
        "pricePerDay": 60, 
        "pricePerWeek": 200, 
        "pricePerMonth": 500, 
        "supplyCost": 0,
        "stock": 2,
        "bookedDates": []

    });

    await davis.save().then(() => {
        console.log('Davis Seeded');
    });

    let micMast = new Equipment({
        "itemName": "Microphone Mast", 
        "description": "Approx 1.2 - 1.4m, screws into logger case, made to order",
        "images": "https://i.postimg.cc/YCVD7J8g/20161122-U4-PM.jpg",
        "pricePerDay": 0, 
        "pricePerWeek": 0, 
        "pricePerMonth": 0, 
        "supplyCost": 110,
        "stock": Infinity,
        "bookedDates": []
    });

    await micMast.save().then(() => {
        console.log('Mic Mast Seeded')
    });

    
    // Dummy Users as outlined in documentation user stories

    let richardWhitely = new User({
        "firstName": "Richard",
        "lastName": "Whitely",
        "businessName": "RWAcoustics",
        "telephone": 12345678910,
        "email": "richard@rwacoustics.com",
        "password": await hashPassword("b1grich123"),
        "address": "4 White Lane, Brisbane, QLD, 4021",
        "admin": false
    });

    await richardWhitely.save().then(() => {
        console.log('Richard Whitely Seeded')
    });

    let annikaRice = new User({
        "firstName": "Annika",
        "lastName": "Rice",
        "businessName": "OzAcoustic Inc.",
        "telephone": 987654321,
        "email": "annika@ozacoustics.com",
        "password": await hashPassword("password123"),
        "address": "432 / 1 Martin Place, Sydney, NSW, 2000 ",
        "admin": false
    });

    await annikaRice.save().then(() => {
        console.log('Annika Rice Seeded')
    });

    let carolVorderman = new User({
        "firstName": "Carol",
        "lastName": "Vorderman",
        "businessName": "Cazzacoutica",
        "telephone": 95762839,
        "email": "carol@cazzacoustica.com",
        "password": await hashPassword("bosslady3000"),
        "address": "33 Main St, Perth, WA, 3098",
        "admin": false
    });

    await carolVorderman.save().then(() => {
        console.log('Carol Vorderman Seeded')
    });

    let kateOSullivan = new User({
        "firstName": "Kate",
        "lastName": "O'Sullivan",
        "businessName": "WIS",
        "telephone": 43219876,
        "email": "kate@wis.com",
        "password": await hashPassword("iamkate2023"),
        "address": "59 Hello Ave, Brisbane, QLD 4987",
        "admin": true
    });

    await kateOSullivan.save().then(() => {
        console.log('Kate OSullivan(admin) Seeded')
    });

    
});