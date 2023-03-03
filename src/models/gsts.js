const mongoose = require("mongoose");
const validator = require("validator");

const gstSchema = new mongoose.Schema({
    minTariff: {
        type: Number,
        default: 0,
        required: [true, 'Minimum tariff require!'],
        min: [1, 'Invalid minimum tariff!'],
    }, 
    maxTariff: {
        type: Number,
        default: 0,
        required: [true, 'Maximum tariff require!'],
        min: [1, 'Invalid maximum tariff!'],
    }, 
    gstPercentage: {
        type: Number,
        default: 0,
        required: [true, 'GST parcentage require!'],
        min: [1, 'Invalid GST!'],
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

const GST = new mongoose.model('GST', gstSchema);

module.exports = GST;