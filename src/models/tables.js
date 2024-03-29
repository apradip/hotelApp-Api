const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
    }, 
    no: {
        type: String,
        minLength: [1, 'Invalid no!'],
        maxLength: [10, 'Invalid no!'],
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("No require!");
            }
       }
    }, 
    accommodation: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
        maxLength: [1020, 'Invalid description!']
    }, 
    guestId: {
        type: String,
        default: null
    },
    guestCount: {
        type: Number,
        default: 0,
    },
    isOccupied: {
        type: Boolean, 
        default: false
    },
    isEnable: {
        type: Boolean,
        default: true
    }
});

const Table = new mongoose.model("Table", tableSchema);
module.exports = Table;