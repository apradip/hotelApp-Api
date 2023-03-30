const mongoose = require("mongoose");
const date = require("date-and-time");
const validator = require("validator");

const guestItemSchema = new mongoose.Schema({
    id: {
        type: String, 
        required: [true, 'Invalid item!']
    },
    name: {
        type: String, 
        required: [true, 'Invalid item!']
    },
    price: {
        type: Number, 
        required: [true, 'Invalid price!'],
        min: [1, 'Invalid minimum price!'],
    },
    quantity: {
        type: Number, 
        required: [true, 'Invalid quantity!'],
        min: [1, 'Invalid minimum quantity!'],
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
        required: [true, 'Delivery date require!'],
    },
    deliveryTime: {
        type: String,
        default: date.format(new Date(),'HH:mm'),
        required: [true, 'Delivery time require!'],
    },
    updatedDate: { 
        type: Date, 
        default: Date.now 
    }
});

const GuestItem = new mongoose.model('GuestItem', guestItemSchema);

module.exports = GuestItem;