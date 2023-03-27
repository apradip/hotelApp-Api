const mongoose = require("mongoose");
const date = require("date-and-time");
const validator = require("validator");

const guestTableFoodSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
    },
    guestId: {
        type: String, 
        required: [true, 'Invalid guest!']
    },
    tableId: {
        type: String, 
        required: [true, 'Invalid room!']
    },
    tableNo: {
        type: String, 
        required: [true, 'Invalid room!']
    },
    foodId: {
        type: String, 
        required: [true, 'Invalid food!']
    },
    foodName: {
        type: String, 
        required: [true, 'Invalid food!']
    },
    foodPrice: {
        type: Number, 
        required: [true, 'Invalid price!'],
        min: [1, 'Invalid minimum price!'],
    },
    foodQuantity: {
        type: Number, 
        required: [true, 'Invalid quantity!'],
        min: [1, 'Invalid minimum quantity!'],
    },
    orderDate: {
        type: Date,
        default: date.format(new Date(),'YYYY-MM-DD'),
        required: [true, 'Occupancy date require!'],
    },
    orderTime: {
        type: String,
        default: date.format(new Date(),'HH:mm'),
        required: [true, 'Occupancy time require!'],
    },
    deliveryDate: {
        type: Date,
        default: date.format(new Date(),'YYYY-MM-DD'),
        required: [true, 'Occupancy date require!'],
    },
    deliveryTime: {
        type: String,
        default: date.format(new Date(),'HH:mm'),
        required: [true, 'Occupancy time require!'],
    },
    updatedDate: { 
        type: Date, 
        default: Date.now 
    },
    isEnable: {
        type: Boolean,
        default: true
    }
});

const GuestTableFood = new mongoose.model('GuestTableFood', guestTableFoodSchema);

module.exports = GuestTableFood;