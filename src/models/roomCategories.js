const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
    id: {
        type: String
    },
    image: {
        type: String
    },
    description: {
        type: String
    }
});

const roomCategorySchema = new mongoose.Schema({
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
        },
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
    images: [ImageSchema],
    isEnable: {
        type: Boolean,
        default: true
    }
});

const RoomCategory = new mongoose.model("RoomCategory", roomCategorySchema);
module.exports = RoomCategory;