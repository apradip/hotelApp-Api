const mongoose = require("mongoose");
// const validator = require("validator");

const tableSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
    }, 
    no: {
        type: String,
        minLength: [1, 'Invalid no!'],
        maxLength: [10, 'Invalid no!']
    }, 
    description: {
        type: String,
        minLength: [3, 'Invalid description!'],
        maxLength: [1020, 'Invalid description!']
    }, 
    guestId: {
        type: String,
        default: null
    },
    isOccupied: {
        type: Boolean, 
        default: false
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

const Table = new mongoose.model('Table', tableSchema);

module.exports = Table;