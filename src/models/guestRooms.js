const mongoose = require("mongoose");
const validator = require("validator");

const guestRoomSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid data!']
    },
    guestId: {
        type: String, 
        required: [true, 'Invalid guest!']
    },
    roomId: {
        type: String, 
        required: [true, 'Invalid room!']
    },
    roomNo: {
        type: String, 
        required: [true, 'Invalid room!']
    },
    tariff: {
        type: Number,
        default: 0,
        required: [true, 'Ttariff require!'],
        min: [1, 'Invalid tariff!'],
    },
    extraBedCount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid extra bed count!']
    },
    extraBedTariff: {
        type: Number,
        default: 0,
        min: [0, 'Invalid extra bed charge!']
    },
    extraPersonCount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid extra person count!'],
    },
    extraPersonTariff: {
        type: Number,
        default: 0,
        min: [0, 'Invalid extra person charge!']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid discount!']
    },
    maxDiscount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid max. discount!']
    },
    gstPercentage: {
        type: Number,
        default: 0,
        min: [0, 'Invalid gst percentage!']
    },
    gstAmount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid gst!']
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'Invalid price!']
    },
    occupancyDate: {
        type: Date,
        default: Date.now,
        required: [true, 'Occupancy date require!'],
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

const GuestRoom = new mongoose.model('GuestRoom', guestRoomSchema);

module.exports = GuestRoom;