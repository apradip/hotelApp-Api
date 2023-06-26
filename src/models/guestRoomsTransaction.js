const mongoose = require("mongoose");
const validator = require("validator");

const guestRoomTransactionSchema = new mongoose.Schema({
    hotelId: {
        type: String
    },
    guestId: {
        type: String
    },
    id: {
        type: String
    },
    no: {
        type: String
    },
    tariff: {
        type: Number
    },
    extraPersonTariff: {
        type: Number
    },
    extraBedTariff: {
        type: Number
    },
    maxDiscount: {
        type: Number
    },
    gstPercentage: {
        type: Number
    },
    extraPersonCount: {
        type: Number
    },
    extraBedCount: {
        type: Number
    },
    discount: {
        type: Number
    },
    gstCharge: {
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