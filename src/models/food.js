const mongoose = require("mongoose");
const validator = require("validator");

const foodSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid data!']
    }, 
    name: {
        type: String,
        minLength: [6, 'Invalid name!'],
        maxLength: [100, 'Invalid name!'],
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("Name require!");
            }
       }
    }, 
    description: {
        type: String,
        minLength: [3, 'Invalid description!'],
        maxLength: [1020, 'Invalid description!'],
        validate(value) {
            if (value ===  "" || value ===  null) {
                throw new Error("Name require!");
            }
       }
    }, 
    price: {
        type: Number,
        default: 0,
        min: [0, 'Invalid price!']
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

const Food = new mongoose.model('Food', foodSchema);

module.exports = Food;