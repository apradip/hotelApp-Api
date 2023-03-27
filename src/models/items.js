const mongoose = require("mongoose");
const validator = require("validator");

const itemSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
    }, 
    name: {
        type: String,
        minLength: [3, 'Invalid name!'],
        maxLength: [100, 'Invalid name!']
    },
    price: {
        type: Number,
        default: 0,
        required: [true, 'Price require!'],
        min: [1, 'Invalid price!']
    },
    description: {
        type: String,
        minLength: [3, 'Invalid description!'],
        maxLength: [1020, 'Invalid description!']
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

const Item = new mongoose.model('Item', itemSchema);

module.exports = Item;