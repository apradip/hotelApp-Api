const mongoose = require("mongoose");
// const validator = require("validator");

const gstSchema = new mongoose.Schema({
    maxTariff: {
        type: Number,
        required: [true, 'Maximum tariff require!'],
        min: [1, 'Invalid maximum tariff!'],
        default: function() {
            return this.maxTariff ? (this.maxTariff).toFixed(2) : 0
        }        
    }, 
    minTariff: {
        type: Number,
        required: [true, 'Minimum tariff require!'],
        min: [1, 'Invalid minimum tariff!'],
        default: function() {
            return this.minTariff ? (this.minTariff).toFixed(2) : 0
        }        
    }, 
    gstPercentage: {
        type: Number,
        required: [true, 'GST parcentage require!'],
        min: [1, 'Invalid GST!'],
        default: function() {
            return this.gstPercentage ? (this.gstPercentage).toFixed(2) : 0
        }        
    }, 
    isEnable: {
        type: Boolean,
        default: true
    }
});

const GST = new mongoose.model("GST", gstSchema);
module.exports = GST;