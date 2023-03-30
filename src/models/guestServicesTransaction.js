const mongoose = require("mongoose");
const date = require("date-and-time");
// const validator = require("validator");

const guestServiceTransactionSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
    },
    guestId: {
        type: String, 
        required: [true, 'Invalid guest!']
    },
    serviceId: {
        type: String, 
        required: [true, 'Invalid service!']
    },
    name: {
        type: String, 
        required: [true, 'Invalid service!']
    },
    serviceChargePercentage: {
        type: Number,
        // default: 0,
    //     validate(value) {
    //         if (value === "" || value === null) {
    //             throw new Error("Invalid service charge!");
    //         } else {
    //             if (value <= 0) {
    //                 throw new Error("Invalid service charge!");
    //             }
    //         }
    //    }
    },
    serviceCharge: {
        type: Number,
        // default: 0,
    //     validate(value) {
    //         if (value === "" || value === null) {
    //             throw new Error("Invalid service change!");
    //         } else {
    //             if (value <= 0) {
    //                 throw new Error("Invalid service change!");
    //             }
    //         }
    //    }
    },
    gstPercentage: {
        type: Number,
        // default: 0,
    //     validate(value) {
    //         if (value === "" || value === null) {
    //             throw new Error("Invalid gst charge!");
    //         } else {
    //             if (value <= 0) {
    //                 throw new Error("Invalid gst charge!");
    //             }
    //         }
    //    }
    },
    gstCharge: {
        type: Number,
        // default: 0,
    //     validate(value) {
    //         if (value === "" || value === null) {
    //             throw new Error("Invalid gst change!");
    //         } else {
    //             if (value <= 0) {
    //                 throw new Error("Invalid gst change!");
    //             }
    //         }
    //    }
    },
    unitPrice: {
        type: Number, 
        // required: [true, 'Invalid price!'],
        // min: [1, 'Invalid minimum price!'],
    },
    quantity: {
        type: Number, 
        // required: [true, 'Invalid quantity!'],
        // min: [1, 'Invalid minimum quantity!'],
    },
    totalPrice: {
        type: Number, 
        // required: [true, 'Invalid total!'],
        // min: [1, 'Invalid minimum total!'],
    },
    orderDate: {
        type: Date,
        default: date.format(new Date(),'YYYY-MM-DD'),
        required: [true, 'Order date require!'],
    },
    orderTime: {
        type: String,
        default: date.format(new Date(),'HH:mm'),
        required: [true, 'Order time require!'],
    },
    deliveryDate: {
        type: Date,
        default: date.format(new Date(),'YYYY-MM-DD'),
        required: [true, 'Despatch date require!'],
    },
    deliveryTime: {
        type: String,
        default: date.format(new Date(),'HH:mm'),
        required: [true, 'Despatch time require!'],
    }
});

const GuestServiceTransaction = new mongoose.model('GuestServiceTransaction', guestServiceTransactionSchema);

module.exports = GuestServiceTransaction;