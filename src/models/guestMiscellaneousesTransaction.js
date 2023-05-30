const mongoose = require("mongoose");

const guestMiscellaneousTransactionSchema = new mongoose.Schema({
    hotelId: {
        type: String
    },
    guestId: {
        type: String
    },
    miscellaneousId: {
        type: String
    },
    name: {
        type: String 
    },
    serviceChargePercentage: {
        type: Number
    },
    serviceCharge: {
        type: Number
    },
    gstPercentage: {
        type: Number
    },
    gstCharge: {
        type: Number
    },
    unitPrice: {
        type: Number
    },
    quantity: {
        type: Number 
    },
    totalPrice: {
        type: Number
    },
    orderDate: {
        type: String
    },
    orderTime: {
        type: String
    },
    despatchDate: {
        type: String
    },
    despatchTime: {
        type: String
    }
});

const GuestMiscellaneousTransaction = new mongoose.model("GuestMiscellaneousTransaction", guestMiscellaneousTransactionSchema);
module.exports = GuestMiscellaneousTransaction;