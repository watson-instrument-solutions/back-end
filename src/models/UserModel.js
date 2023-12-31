const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const UserSchema = new Schema({
    firstName: {
        type: String,
        required: false,
        unique: false,
        trim: true
    },
    lastName: {
        type: String,
        required: false,
        unique: false,
        trim: true
    },
    businessName: {
        type: String,
        required: false,
        unique: false,
        trim: true
    },
    telephone: {
        type: Number,
        required: false,
        unique: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    password: {
        type: String,
        required: true,
        unique: false,
        minlength: 8
    },
    address: {
        type: String,
        required: false,
        unique: false,
        trim: true
    },
    admin: {
        type: Boolean,
        default: false
    }
});


// const ModelName = mongoose.model('Name that appears in Cloud Atlas GUI');
const User = mongoose.model('User', UserSchema);

module.exports = {
	User
}