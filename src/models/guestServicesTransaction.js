const mongoose = require("mongoose");
// const validator = require("validator");

const guestServiceTransactionSchema = new mongoose.Schema({
    hotelId: {
        type: String
    },
    guestId: {
        type: String 
    },
    serviceId: {
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

const GuestServiceTransaction = new mongoose.model("GuestServiceTransaction", guestServiceTransactionSchema);
module.exports = GuestServiceTransaction;