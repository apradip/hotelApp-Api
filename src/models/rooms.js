const mongoose = require("mongoose");
// const validator = require("validator");

const roomSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
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
       }
    }, 
    tariff: {
        type: Number,
        required: [true, 'Ttariff require!'],
        min: [1, 'Invalid tariff!'],
        default: function() {
            return this.tariff ? (this.tariff).toFixed(2) : 0
        }        
    },
    maxDiscount: {
        type: Number,
        min: [0, 'Invalid discount!'],
        default: function() {
            return this.maxDiscount ? (this.maxDiscount).toFixed(2) : 0
        },        
        validate(value) {
            if (this.tariff < value) {
                throw new Error("Incorrect discount!");
            }
        }
    },
    extraBedTariff: {
        type: Number,
        min: [0, 'Invalid extra bed charge!'],
        default: function() {
            return this.extraBedTariff ? (this.extraBedTariff).toFixed(2) : 0
        },        
        validate(value) {
            if (this.tariff < value) {
                throw new Error("Incorrect extra bed charge!");
            }
        }
    },
    extraPersonTariff: {
        type: Number,
        min: [0, 'Invalid extra person charge!'],
        default: function() {
            return this.extraPersonTariff ? (this.extraPersonTariff).toFixed(2) : 0
        },        
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
    isEnable: {
        type: Boolean,
        default: true
    }
});

const Room = new mongoose.model('Room', roomSchema);
module.exports = Room;