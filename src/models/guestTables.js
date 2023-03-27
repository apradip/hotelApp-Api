const mongoose = require("mongoose");
const date = require("date-and-time");
const validator = require("validator");

const guestTableSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
    },
    guestId: {
        type: String, 
        required: [true, 'Invalid guest!']
    },
    tableId: {
        type: String, 
        required: [true, 'Invalid room!']
    },
    tableNo: {
        type: String, 
        required: [true, 'Invalid room!']
    },
    checkInDate: {
        type: Date,
        default: date.format(new Date(),'YYYY-MM-DD'),
        required: [true, 'Occupancy date require!'],
    },
    checkInTime: {
        type: String,
        default: date.format(new Date(),'HH:mm'),
        required: [true, 'Occupancy time require!'],
    },
    checkOutDate: {
        type: Date,
        default: date.format(new Date(),'YYYY-MM-DD'),
        required: [true, 'Occupancy date require!'],
    },
    checkinOutTime: {
        type: String,
        default: date.format(new Date(),'HH:mm'),
        required: [true, 'Occupancy time require!'],
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

const GuestTable1 = new mongoose.model('GuestTable1', guestTableSchema);

module.exports = GuestTable1;