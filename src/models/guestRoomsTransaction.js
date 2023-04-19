const mongoose = require("mongoose");
const date = require("date-and-time");
const validator = require("validator");

const guestRoomTransactionSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        // required: [true, 'Invalid hotel!']
    },
    guestId: {
        type: String, 
        // required: [true, 'Invalid guest!']
    },
    roomId: {
        type: String, 
        // required: [true, 'Invalid room!']
    },
    no: {
        type: String, 
        // required: [true, 'Invalid room!']
    },
    tariff: {
        type: Number,
        // default: 0,
        // required: [true, 'Ttariff require!'],
        // min: [1, 'Invalid tariff!'],
    },
    extraBedCount: {
        type: Number,
        // default: 0,
        // min: [0, 'Invalid extra bed count!']
    },
    extraBedTariff: {
        type: Number,
        // default: 0,
        // min: [0, 'Invalid extra bed charge!']
    },
    extraPersonCount: {
        type: Number,
        // default: 0,
        // min: [0, 'Invalid extra person count!'],
    },
    extraPersonTariff: {
        type: Number,
        // default: 0,
        // min: [0, 'Invalid extra person charge!']
    },
    discount: {
        type: Number,
        // default: 0,
        // min: [0, 'Invalid discount!']
    },
    maxDiscount: {
        type: Number,
        // default: 0,
        // min: [0, 'Invalid max. discount!']
    },
    gstPercentage: {
        type: Number,
        // default: 0,
        // min: [0, 'Invalid gst percentage!']
    },
    gstAmount: {
        type: Number,
        // default: 0,
        // min: [0, 'Invalid gst!']
    },
    totalPrice: {
        type: Number,
        // default: 0,
        // min: [0, 'Invalid price!']
    },
    occupancyDate: {
        type: Date,
    }
    // updatedDate: { 
    //     type: Date, 
    //     default: Date.now 
    // },
    // isEnable: {
    //     type: Boolean,
    //     default: true
    // }
});

const GuestRoomTransaction = new mongoose.model('GuestRoomTransaction', guestRoomTransactionSchema);

module.exports = GuestRoomTransaction;