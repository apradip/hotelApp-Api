const mongoose = require("mongoose");
const date = require("date-and-time");
// const validator = require("validator");

const roomSchema = new mongoose.Schema({
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
        default: 0,
        min: [1, 'Invalid tariff!'],
    },
    extraBedCount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid extra bed count!']
    },
    extraBedTariff: {
        type: Number,
        default: 0,
        min: [0, 'Invalid extra bed charge!']
    },
    extraPersonCount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid extra person count!'],
    },
    extraPersonTariff: {
        type: Number,
        default: 0,
        min: [0, 'Invalid extra person charge!']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid discount!']
    },
    maxDiscount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid max. discount!']
    },
    gstPercentage: {
        type: Number,
        default: 0,
        min: [0, 'Invalid gst percentage!']
    },
    gstAmount: {
        type: Number,
        default: 0,
        min: [0, 'Invalid gst!']
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'Invalid price!']
    },
    checkInDate: { 
        type: String, 
        default: date.format(new Date(),'YYYY-MM-DD')
    },
    checkInTime: { 
        type: String, 
        default: date.format(new Date(),'HH:mm')
    },
    checkOutDate: { 
        type: String, 
    },
    chekOutTime: { 
        type: String, 
    }
});

const foodSchema = new mongoose.Schema({
    id: {
        type: String,
        required: [true, 'Invalid food!']
    },
    name: {
        type: String,
        required: [true, 'Invalid food!']
    },
    quantity: {
        type: Number,
        default: 0,
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("Invalid quantity!");
            } else {
                if (value <= 0) {
                    throw new Error("Invalid quantity!");
                }
            }
       }
    },
    serviceChargePercentage: {
        type: Number,
        default: 0,
    },
    serviceCharge: {
        type: Number,
        default: 0,
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("Invalid service change!");
            } else {
                if (value <= 0) {
                    throw new Error("Invalid service change!");
                }
            }
       }
    },
    gstPercentage: {
        type: Number,
        default: 0,
    },
    gstCharge: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    orderDate: { 
        type: String, 
        default: date.format(new Date(),'YYYY-MM-DD')
    },
    orderTime: { 
        type: String, 
        default: date.format(new Date(),'HH:mm')
    },
    despatchDate: { 
        type: String,
    },
    despatchTime: { 
        type: String,
    }
});

const tableSchema = new mongoose.Schema({
    id: { 
        type:String,
    },
    no: { 
        type:String,
    },
    inDate: { 
        type: String, 
        default: date.format(new Date(),'YYYY-MM-DD')
    },
    inTime: { 
        type: String, 
        default: date.format(new Date(),'HH:mm')
    },
    foods: [foodSchema],
    total: {
        type: Number,
        default: 0,
    },
    outDate: { 
        type: String, 
    },
    outTime: { 
        type: String, 
    },
    updatedDate: { 
        type: Date, 
        default: Date.now 
    }
});

const miscellaneousSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    name: {
        type: String,
    },
    serviceChargePercentage: {
        type: Number,
    },
    serviceCharge: {
        type: Number,
        default: function() {
            return (this.unitPrice * this.quantity) * (this.serviceChargePercentage / 100)
          }        
    },
    gstPercentage: {
        type: Number,
    },
    gstCharge: {
        type: Number,
        default: function() {
            return (this.unitPrice * this.quantity) * (this.gstPercentage / 100)
          }        
    },
    unitPrice: {
        type: Number,
    },
    quantity: {
        type: Number,
    },
    totalPrice: {
        type: Number,
        default: function() {
          return (this.unitPrice * this.quantity) + this.gstCharge + this.serviceCharge
        }        
    }
});

const miscellaneousTransactionSchema = new mongoose.Schema({
    miscellaneouses: [miscellaneousSchema],
    orderDate: { 
        type: String, 
        default: date.format(new Date(),'YYYY-MM-DD')
    },
    orderTime: { 
        type: String, 
        default: date.format(new Date(),'HH:mm')
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
        type: String,
        required: [true, 'Invalid food!']
    },
    name: {
        type: String,
        required: [true, 'Invalid food!']
    },
    serviceChargePercentage: {
        type: Number,
        default: 0,
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("Invalid service charge!");
            } else {
                if (value <= 0) {
                    throw new Error("Invalid service charge!");
                }
            }
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
        default: 0,
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("Invalid gst charge!");
            } else {
                if (value <= 0) {
                    throw new Error("Invalid gst charge!");
                }
            }
       }
    },
    gstCharge: {
        type: Number,
        default: function() {
            return (this.unitPrice * this.quantity) * (this.gstPercentage / 100)
        }        
    },
    unitPrice: {
        type: Number,
        default: 0,
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("Invalid unit price!");
            } else {
                if (value <= 0) {
                    throw new Error("Invalid unit price!");
                }
            }
       }
    },
    quantity: {
        type: Number,
        default: 0,
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("Invalid quantity!");
            } else {
                if (value <= 0) {
                    throw new Error("Invalid quantity!");
                }
            }
       }
    },
    totalPrice: {
        type: Number,
        default: function() {
          return (this.unitPrice * this.quantity) + this.gstCharge + this.serviceCharge
        }        
    },
    orderDate: { 
        type: String, 
        default: date.format(new Date(),'YYYY-MM-DD')
    },
    orderTime: { 
        type: String, 
        default: date.format(new Date(),'HH:mm')
    },
    despatchDate: { 
        type: String, 
    },
    despatchTime: { 
        type: String, 
    }
});

const expensesPaymentsTransactionSchema = new mongoose.Schema({
    type: {
        type: String
    },
    expenseId: {
        type: String
    },
    expenseAmount: {
        type: Number,
        default: 0
    },
    paymentAmount: {
        type: Number,
        default: 0
    },
    narration: {
        type: String
    },
    transactionDate: {
        type: Date,
        default: new Date()
    },
    transactionTime: {
        type: String,
        default: date.format(new Date(),'HH:mm')
    }
});



const guestSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
    },
    idDocumentId: {
        type: String, 
    },
    idNo: {
        type: String,
        minLength: [6, 'Invalid id no!'],
        maxLength: [100, 'Invalid id no!'],
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
        type: Number,
        // default: 0,
        // min: [1, 'Invalid age!'],
    },
    fatherName: {
        type: String,
        minLength: [3, 'Invalid name!'],
        maxLength: [100, 'Invalid name!'],
    }, 
    address: {
        type: String,
        minLength: [3, 'Invalid address!'],
        maxLength: [1020, 'Invalid address!']
    }, 
    city: {
        type: String,
        minLength: [3, 'Invalid city!'],
        maxLength: [100, 'Invalid city!'],
    },
    policeStation: {
        type: String,
        minLength: [3, 'Invalid p.s!'],
        maxLength: [100, 'Invalid p.s!'],
    },
    state: {
        type: String,
        minLength: [3, 'Invalid state!'],
        maxLength: [100, 'Invalid state!'],
    },
    pin: {
        type: String,
        minLength: [6, 'Invalid pin!'],
        maxLength: [10, 'Invalid pin!'],
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
        min: [1, 'Invalid no. of guest!'],
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
    roomsDetail: {
        bookingAgentId: {
            type: String, 
        },
        planId: {
            type: String, 
        },
        rooms: [roomSchema],
        roomTotal: {
            type: Number,
            default: 0,
        },
        foods: [foodSchema],
        foodTotal: {
            type: Number,
            default: 0,
        },
    },
    tablesDetail: {
        tables: [tableSchema],
        total: {
            type: Number,
            default: 0,
        }
    },
    miscellaneousesDetail: [miscellaneousTransactionSchema],
    servicesDetail: {
        services: [serviceSchema],
        total: {
            type: Number,
            default: 0
        }
    },
    expensesPaymentsDetail: [expensesPaymentsTransactionSchema],
    inDate: {
        type: Date,
        default: date.format(new Date(),'YYYY-MM-DD'),
        required: [true, 'Check in date require!'],
    },
    inTime: {
        type: String,
        default: date.format(new Date(),'HH:mm'),
        required: [true, 'Check in time require!'],
    },
    outDate: {
        type: Date,
        //default: Date.now,
        //required: [true, 'Check out date require!'],
    },
    outTime: {
        type: String,
        // default: date.format(new Date(),'HH:mm'),
        // required: [true, 'Check in time require!'],
    },
    option: {
        type: String,
        default: "S",
        required: [true, 'option require!'],
    },
    isActive: {
        type: Boolean,
        default: true
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

const Guest = new mongoose.model('Guest', guestSchema);
module.exports = Guest;