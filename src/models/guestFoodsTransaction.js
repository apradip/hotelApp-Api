const mongoose = require("mongoose");
const date = require("date-and-time");

const guestFoodTransactionSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
    },
    guestId: {
        type: String, 
        required: [true, 'Invalid guest!']
    },
    foodId: {
        type: String, 
        required: [true, 'Invalid foods!']
    },
    name: {
        type: String, 
        required: [true, 'Invalid miscellaneous!']
    },
    serviceChargePercentage: {
        type: Number,
        required: [true, 'Invalid service charge percentage!']
    },
    serviceCharge: {
        type: Number,
        required: [true, 'Invalid service charge!']
    },
    gstPercentage: {
        type: Number,
        required: [true, 'Invalid gst charge percentage!']
    },
    gstCharge: {
        type: Number,
        required: [true, 'Invalid gst charge!']
    },
    unitPrice: {
        type: Number, 
        required: [true, 'Invalid unit price!']
    },
    quantity: {
        type: Number, 
        required: [true, 'Invalid quantity!']
    },
    totalPrice: {
        type: Number, 
        required: [true, 'Invalid total price!']
    },
    orderDate: {
        type: Date,
        required: [true, 'Invalid order date!']
    },
    orderTime: {
        type: String,
        required: [true, 'Invalid order time!']
    },
    despatchDate: {
        type: Date,
        required: [true, 'Invalid despatch date!']
    },
    despatchTime: {
        type: String,
        required: [true, 'Invalid despatch time!']
    }
});

const GuestFoodTransaction = new mongoose.model('GuestFoodTransaction', guestFoodTransactionSchema);

module.exports = GuestFoodTransaction;