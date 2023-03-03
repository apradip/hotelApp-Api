const mongoose = require("mongoose");
const validator = require("validator");

const roomSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid data!']
    }, 
    categoryId: {
        type: String,
        required: [true, 'Invalid category!']
    }, 
    no: {
        type: String,
        minLength: [1, 'Invalid no!'],
        maxLength: [10, 'Invalid no!'],
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("No require!");
            }

            // if (hotelId + name === this.hotelId + value ) {
            //     throw new Error("This data already exists!");
            // }
       }
    }, 
    tariff: {
        type: Number,
        default: 0,
        required: [true, 'Ttariff require!'],
        min: [1, 'Invalid tariff!'],
    },
    maxDiscount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid discount!'],
        validate(value) {
            if (this.tariff < value) {
                throw new Error("Incorrect discount!");
            }
        }
    },
    extraBedTariff: {
        type: Number,
        default: 0,
        min: [0, 'Invalid extra bed charge!'],
        validate(value) {
            if (this.tariff < value) {
                throw new Error("Incorrect extra bed charge!");
            }
        }
    },
    extraPersonTariff: {
        type: Number,
        default: 0,
        min: [0, 'Invalid extra person charge!'],
        validate(value) {
            if (this.tariff < value) {
                throw new Error("Incorrect extra person charge!");
            }
        }
    },
    isOccupied: {
        type: Boolean, 
        debugger: false
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

const Room = new mongoose.model('Room', roomSchema);

module.exports = Room;