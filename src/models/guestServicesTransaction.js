const mongoose = require("mongoose");


const guestServiceTransactionSchema = new mongoose.Schema({
    hotelId: {
        type: String
    },
    guestId: {
        type: String 
    },
    id: {
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
        type: Date
        // type: String
    },
    // orderTime: {
    //     type: String
    // },
    despatchDate: {
        type: Date
        // type: String
    },
    // despatchTime: {
    //     type: String
    // }
});

const GuestServiceTransaction = new mongoose.model("GuestServiceTransaction", guestServiceTransactionSchema);
module.exports = GuestServiceTransaction;