const mongoose = require("mongoose");
// const validator = require("validator");

const guestFoodTransactionSchema = new mongoose.Schema({
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
    unitPrice: {
        type: Number
    },
    quantity: {
        type: Number
    },
    serviceChargePercentage: {
        type: Number
    },
    gstPercentage: {
        type: Number
    },
    serviceCharge: {
        type: Number,
        // default: function() {
        //     return ((this.unitPrice * this.quantity) * (this.serviceChargePercentage / 100)).toFixed(2)
        // }        
    },
    gstCharge: {
        type: Number,
        // default: function() {
        //     return ((this.unitPrice * this.quantity) * (this.gstPercentage / 100)).toFixed(2)
        // }
    },
    totalPrice: {
        type: Number,
        // default: function() {
        //     return ((this.unitPrice * this.quantity) + this.serviceCharge + this.gstCharge).toFixed(2)
        // }        
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

const GuestFoodTransaction = new mongoose.model("GuestFoodTransaction", guestFoodTransactionSchema);
module.exports = GuestFoodTransaction;