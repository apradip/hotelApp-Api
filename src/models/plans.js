const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
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
    description: {
        type: String,
        maxLength: [1020, 'Invalid description!'],
    }, 
    isEnable: {
        type: Boolean,
        default: true
    }
});

const Plan = new mongoose.model("Plan", planSchema);
module.exports = Plan;