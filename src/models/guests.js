const mongoose = require("mongoose");
const validator = require("validator");
const date = require("date-and-time");

const roomTransactionSchema = new mongoose.Schema({
    id: { 
        type:String,
        required: [true, 'Table id require!'],   
    },
    no: { 
        type:String,
        required: [true, 'Table no require!'],   
    },
    tariff: {
        type: Number,
        min: [1, 'Invalid tariff!'],
        default: function() {
            return this.tariff ? (this.tariff).toFixed(2) : 0
        }        
    },
    extraBedCount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid extra bed count!']
    },
    extraBedTariff: {
        type: Number,
        min: [0, 'Invalid extra bed charge!'],
        default: function() {
            return this.extraBedTariff ? (this.extraBedTariff).toFixed(2) : 0
        }        
    },
    extraPersonCount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid extra person count!'],
    },
    extraPersonTariff: {
        type: Number,
        min: [0, 'Invalid extra person charge!'],
        default: function() {
            return this.extraPersonTariff ? (this.extraPersonTariff).toFixed(2) : 0
        }        
    },
    discount: {
        type: Number,
        min: [0, 'Invalid discount!'],
        default: function() {
            return this.discount ? (this.discount).toFixed(2) : 0
        }        
    },
    maxDiscount: {
        type: Number,
        min: [0, 'Invalid max. discount!'],
        default: function() {
            return this.maxDiscount ? (this.maxDiscount).toFixed(2) : 0
        }        
    },
    gstPercentage: {
        type: Number,
        min: [0, 'Invalid gst percentage!'],
        default: function() {
            return this.gstPercentage ? (this.gstPercentage).toFixed(2) : 0
        }        
    },
    gstCharge: {
        type: Number,
        min: [0, 'Invalid gst!'],
        default: function() {
            return this.gstCharge ? (this.gstCharge).toFixed(2) : 0
        }        
    },
    totalPrice: {
        type: Number,
        min: [0, 'Invalid price!'],
        default: function() {
            return this.totalPrice ? (this.totalPrice).toFixed(2) : 0
        }        
    },
    occupancyDate: {
        type: String, 
    }
});

const tableSchema = new mongoose.Schema({
    id: { 
        type:String,
    },
    no: { 
        type:String,
    }
});

const foodSchema = new mongoose.Schema({
    foodId: {
        type: String
    },
    name: {
        type: String
    },
    serviceChargePercentage: {
        type: Number,
        default: function() {
            return this.serviceChargePercentage ? (this.serviceChargePercentage).toFixed(2) : 0
        }        
    },
    serviceCharge: {
        type: Number,
        default: function() {
            return (this.unitPrice * this.quantity) * (this.serviceChargePercentage / 100)
          }        
    },
    gstPercentage: {
        type: Number,
        default: function() {
            return this.gstPercentage ? (this.gstPercentage).toFixed(2) : 0
        }        
    },
    gstCharge: {
        type: Number,
        default: function() {
            let gst = (this.unitPrice * this.quantity) * (this.gstPercentage / 100)
            return this.gst ? (this.gst).toFixed(2) : 0
          }        
    },
    unitPrice: {
        type: Number,
        default: function() {
            return this.unitPrice ? (this.unitPrice).toFixed(2) : 0
        }        
    },
    quantity: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: function() {
            let total = (this.unitPrice * this.quantity) + this.gstCharge + this.serviceCharge
            return total ? (total).toFixed(2) : 0
        }        
    },
    orderDate: { 
        type: String
    },
    orderTime: { 
        type: String
    },
    despatchDate: { 
        type: String
    },
    despatchTime: { 
        type: String 
    },
    // isPostedToExpense: {
    //     type: Boolean,
    //     default: false
    // }
});

const tableTransactionSchema = new mongoose.Schema({
    tables: [tableSchema],
    foods: [foodSchema]
});

const miscellaneousSchema = new mongoose.Schema({
    miscellaneousId: {
        type: String
    },
    name: {
        type: String
    },
    unitPrice: {
        type: Number,
        default: function() {
            return this.unitPrice ? (this.unitPrice).toFixed(2) : 0
        }        
    },
    quantity: {
        type: Number,
    },
    serviceChargePercentage: {
        type: Number,
        default: function() {
            return this.serviceChargePercentage ? (this.serviceChargePercentage).toFixed(2) : 0
        }        
    },
    serviceCharge: {
        type: Number,
        default: function() {
            let service = (this.unitPrice * this.quantity) * (this.serviceChargePercentage / 100);
            return service ? (service).toFixed(2) : 0
        }        
    },
    gstPercentage: {
        type: Number,
        default: function() {
            return this.gstPercentage ? (this.gstPercentage).toFixed(2) : 0
        }        
    },
    gstCharge: {
        type: Number,
        default: function() {
            let gst = (this.unitPrice * this.quantity) * (this.gstPercentage / 100);
            return gst ? gst.toFixed(2) : 0
        }        
    },
    totalPrice: {
        type: Number,
        default: function() {
            let price = (this.unitPrice * this.quantity) + (this.gstCharge + this.serviceCharge);
            return price ? price.toFixed(2) : 0
        }        
    }
});

const miscellaneousTransactionSchema = new mongoose.Schema({
    miscellaneouses: [miscellaneousSchema],
    orderDate: { 
        type: String, 
        default: function() {
            return date.format(new Date(), "YYYY-MM-DD")
        }        
    },
    orderTime: { 
        type: String, 
        default: function() {
            return date.format(new Date(), "HH:mm")
        }        
    },
    despatchDate: { 
        type: String
    },
    despatchTime: { 
        type: String 
    },
    isPostedToExpense: {
        type: Boolean,
        default: false
    },
});

const serviceSchema = new mongoose.Schema({
    id: {
        type: String
    },
    name: {
        type: String
    },
    serviceChargePercentage: {
        type: Number,
        default: function() {
            return this.serviceChargePercentage ? (this.serviceChargePercentage).toFixed(2) : 0
        }        
    },
    serviceCharge: {
        type: Number,
        default: function() {
            let service = (this.unitPrice * this.quantity) * (this.serviceChargePercentage / 100);
            return service ? (service).toFixed(2) : 0
        }        
    },
    gstPercentage: {
        type: Number,
        default: function() {
            return this.gstPercentage ? (this.gstPercentage).toFixed(2) : 0
        }        
    },
    gstCharge: {
        type: Number,
        default: function() {
            let gst = (this.unitPrice * this.quantity) * (this.gstPercentage / 100);
            return gst ? (gst).toFixed(2) : 0
        }        
    },
    unitPrice: {
        type: Number,
        default: function() {
            return this.unitPrice ? (this.unitPrice).toFixed(2) : 0
        }        
    },
    quantity: {
        type: Number
    },
    totalPrice: {
        type: Number,
        default: function() {
            let total = (this.unitPrice * this.quantity) + (this.gstCharge + this.serviceCharge);
            return total ? (total).toFixed(2) : 0
        }        
    }
});

const serviceTransactionSchema = new mongoose.Schema({
    services: [serviceSchema],
    orderDate: { 
        type: String, 
        default: function() {
            return date.format(new Date(), "YYYY-MM-DD")
        }        
    },
    orderTime: { 
        type: String, 
        default: function() {
            return date.format(new Date(), "HH:mm")
        }        
    },
    despatchDate: { 
        type: String
    },
    despatchTime: { 
        type: String 
    },
    isPostedToExpense: {
        type: Boolean,
        default: false
    },
});

const expensesPaymentsTransactionSchema = new mongoose.Schema({
    billNo: {
        type: Number,
    },
    type: {
        type: String
    },
    expenseId: {
        type: String
    },
    expenseAmount: {
        type: Number,
        default: function() {
            return this.expenseAmount ? (this.expenseAmount).toFixed(2) : 0
        }        
    },
    paymentAmount: {
        type: Number,
        default: function() {
            return this.paymentAmount ? (this.paymentAmount).toFixed(2) : 0
        }        
    },
    narration: {
        type: String
    },
    transactionDate: {
        type: String,
        default: function() {
            return date.format(new Date(), "YYYY-MM-DD")
        }        
    },
    transactionTime: {
        type: String,
        default: function() {
            return date.format(new Date(), "HH:mm")
        }        
    }
});


const guestSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
    },
    idDocumentId: {
        type: String
    },
    idNo: {
        type: String,
        minLength: [6, 'Invalid id no!'],
        maxLength: [100, 'Invalid id no!']
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
    age: {
        type: Number
    },
    fatherName: {
        type: String,
        minLength: [3, 'Invalid name!'],
        maxLength: [100, 'Invalid name!']
    }, 
    address: {
        type: String,
        minLength: [3, 'Invalid address!'],
        maxLength: [1020, 'Invalid address!']
    }, 
    city: {
        type: String,
        minLength: [3, 'Invalid city!'],
        maxLength: [100, 'Invalid city!']
    },
    policeStation: {
        type: String,
        minLength: [3, 'Invalid p.s!'],
        maxLength: [100, 'Invalid p.s!']
    },
    state: {
        type: String,
        minLength: [3, 'Invalid state!'],
        maxLength: [100, 'Invalid state!']
    },
    pin: {
        type: String,
        minLength: [6, 'Invalid pin!'],
        maxLength: [10, 'Invalid pin!']
    },
    phone: {
        type: String
    },
    mobile: {
        type: String,
        minLength: [10, 'Invalid mobile no!'],
        maxLength: [10, 'Invalid mobile no!'],
        validate(value) {
            if (value ===  "" || value ===  null) {
                throw new Error("Mobile no. require!");
            }
       }
    },
    email: {
        type: String,
        minLength: [6, 'Invalid email!'],
        maxLength: [160, 'Invalid email!'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email!']
    },
    guestCount: {
        type: Number,
        default: 0,
        min: [1, 'Invalid no. of guest!']
    },
    guestMaleCount: {
        type: Number,
        // default: 0
    },
    guestFemaleCount: {
        type: Number,
        // default: 0
    },
    corporateName: {
        type: String,
        // minLength: [3, 'Invalid corporate name!'],
        // maxLength: [100, 'Invalid corporate name!'],
    }, 
    corporateAddress: {
        type: String,
        // minLength: [3, 'Invalid corporate address!'],
        // maxLength: [1020, 'Invalid corporate address!'],
    },
    gstNo: {
        type: String,
        // minLength: [15, 'Invalid GST no.!'],
        // maxLength: [15, 'Invalid GST no.!'],
    },
    bookingAgentId: {
        type: String
    },
    planId: {
        type: String
    },
    roomsDetail: [roomTransactionSchema],
    tablesDetail: [tableTransactionSchema],
    miscellaneousesDetail: [miscellaneousTransactionSchema],
    servicesDetail: [serviceTransactionSchema],
    expensesPaymentsDetail: [expensesPaymentsTransactionSchema],
    balance: {
        type: Number,
        default: function() {
            return this.balance ? (this.balance).toFixed(2) : 0
        }        
    },
    inDate: {
        type: String,
        default: function() {
            return date.format(new Date(), "YYYY-MM-DD")
        }        
    },
    inTime: {
        type: String,
        default: function() {
            return date.format(new Date(), "HH:mm")
        }        
    },
    outDate: {
        type: String
    },
    outTime: {
        type: String
    },
    option: {
        type: String,
        default: "S",
        required: [true, 'option require!']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEnable: {
        type: Boolean,
        default: true
    }
});

const Guest = new mongoose.model("Guest", guestSchema);
module.exports = Guest;