const mongoose = require("mongoose");
const validator = require("validator");

const guestRoomTransactionSchema = new mongoose.Schema({
    hotelId: {
        type: String
    },
    guestId: {
        type: String
    },
    roomId: {
        type: String
    },
    no: {
        type: String
    },
    tariff: {
        type: Number
    },
    extraBedCount: {
        type: Number
    },
    extraBedTariff: {
        type: Number
    },
    extraPersonCount: {
        type: Number
    },
    extraPersonTariff: {
        type: Number
    },
    discount: {
        type: Number
    },
    maxDiscount: {
        type: Number
    },
    gstPercentage: {
        type: Number
    },
    gstAmount: {
        type: Number
    },
    totalPrice: {
        type: Number
    },
    occupancyDate: {
        type: String
    }
});

const GuestRoomTransaction = new mongoose.model("GuestRoomTransaction", guestRoomTransactionSchema);
module.exports = GuestRoomTransaction;