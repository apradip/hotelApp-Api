const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
    }, 
    name: {
        type: String,
        minLength: [3, 'Invalid name!'],
        maxLength: [100, 'Invalid name!'],
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("Name require!");
            }
       }
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

const Service = new mongoose.model("Service", serviceSchema);
module.exports = Service;
