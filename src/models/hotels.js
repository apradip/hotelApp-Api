const mongoose = require("mongoose");
const validator = require("validator");

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [6, 'Invalid name!'],
        maxLength: [100, 'Invalid name!'],
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("Name require!");
            }
       }
    }, 
    address: {
        type: String,
        minLength: [3, 'Invalid address!'],
        maxLength: [1020, 'Invalid address!']
    }, 
    city: {
        type: String,
        minLength: [3, 'Invalid city!'],
        maxLength: [100, 'Invalid city!'],
    },
    state: {
        type: String,
        minLength: [3, 'Invalid state!'],
        maxLength: [100, 'Invalid state!'],
    },
    pin: {
        type: String,
        minLength: [6, 'Invalid pin!'],
        maxLength: [10, 'Invalid pin!'],
    },
    phone: {
        type: String
    },
    email: {
        type: String,
        minLength: [6, 'Invalid email!'],
        maxLength: [160, 'Invalid email!'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email!']
    },
    webSiteUrl: {
        type: String,
    },
    logoUrl: {
        type: String,
    },
    gstNo: {
        type: String,
    },
    fincialDecimalPlace: {
        type: Number,
        default: 2
    },
    serviceChargePercentage: {
        type: Number,
        default: 12.5
    },
    foodGstPercentage: {
        type: Number,
        default: 10.5
    },
    updatedDate: { 
        type: Date, 
        default: Date.now 
    },
    isEnable: {
        type: Boolean,
        default: true
    }
});

const Hotel = new mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;