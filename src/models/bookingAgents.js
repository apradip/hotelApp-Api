const mongoose = require("mongoose");
const validator = require("validator");

const bookingAgentSchema = new mongoose.Schema({
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
        // minLength: [3, 'Invalid description!'],
        maxLength: [1020, 'Invalid description!'],
    //     validate(value) {
    //         if (value ===  "" || value ===  null) {
    //             throw new Error("Name require!");
    //         }
    //    }
    }, 
    // updatedDate: { 
    //     type: Date, 
    //     default: Date.now 
    // },
    isEnable: {
        type: Boolean,
        default: true
    }
});

const BookingAgent = new mongoose.model("BookingAgent", bookingAgentSchema);
module.exports = BookingAgent;