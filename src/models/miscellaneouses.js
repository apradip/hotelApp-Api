const mongoose = require("mongoose");
// const validator = require("validator");

const miscellaneousSchema = new mongoose.Schema({
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
        required: [true, 'Price require!'],
        min: [1, 'Invalid price!'],
        default: function() {
            return this.price ? (this.price).toFixed(2) : 0
        }        
    },
    description: {
        type: String,
        // minLength: [3, 'Invalid description!'],
        maxLength: [1020, 'Invalid description!']
    }, 
    isEnable: {
        type: Boolean,
        default: true
    }
});

const Miscellaneous = new mongoose.model("Miscellaneous", miscellaneousSchema);
module.exports = Miscellaneous;