const mongoose = require("mongoose");
// const date = require("date-and-time");


const roomSchema = new mongoose.Schema({
    id: { 
        type:String
    },
    no: { 
        type:String
    },
    tariff: {
        type: Number
    },
    extraPersonTariff: {
        type: Number
    },
    extraBedTariff: {
        type: Number
    },
    maxDiscount: {
        type: Number
    },
    gstPercentage: {
        type: Number
    },
    extraBedCount: {
        type: Number,
        default: 0
    },
    extraPersonCount: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number
    },
    gstCharge: {
        type: Number,
        default: function() {
            return (((this.extraPersonCount * this.extraPersonTariff) + 
                    (this.extraBedCount * this.extraBedTariff) + 
                    (this.tariff - this.discount)) * (this.gstPercentage / 100)).toFixed(0);
        }        
    },
    totalPrice: {
        type: Number,
        default: function() {
            return ((this.extraPersonCount * this.extraPersonTariff) + 
                    (this.extraBedCount * this.extraBedTariff) + 
                    (this.tariff - this.discount) +
                    this.gstCharge).toFixed(0);
        }        
    },
    occupancyDate: { 
        type: Date
        // type: String
    },
});

const tableSchema = new mongoose.Schema({
    id: { 
        type:String
    },
    no: { 
        type:String
    }
});

const foodSchema = new mongoose.Schema({
    id: {
        type: String
    },
    name: {
        type: String
    },
    unitPrice: {
        type: Number
    },
    quantity: {
        type: Number
    },
    serviceChargePercentage: {
        type: Number
    },
    gstPercentage: {
        type: Number
    },
    serviceCharge: {
        type: Number,
        default: function() {
            return ((this.unitPrice * this.quantity) * (this.serviceChargePercentage / 100)).toFixed(0);
        }        
    },
    gstCharge: {
        type: Number,
        default: function() {
            return ((this.unitPrice * this.quantity) * (this.gstPercentage / 100)).toFixed(0);
        }        
    },
    totalPrice: {
        type: Number,
        default: function() {
            return ((this.unitPrice * this.quantity) + this.serviceCharge + this.gstCharge).toFixed(0);
        }        
    },
    orderDate: { 
        type: Date,
        default: function() {
            return new Date();
        }

        // type: String,
        // default: function() {
        //     return date.format(new Date(), "YYYY-MM-DD");
        // }
    },
    // orderTime: { 
    //     type: String,
    //     default: function() {
    //         return date.format(new Date(), "HH:mm");
    //     }
    // },
    despatchDate: { 
        type: Date
        // type: String
    },
    // despatchTime: { 
    //     type: String 
    // }
});

const serviceSchema = new mongoose.Schema({
    id: {
        type: String
    },
    name: {
        type: String
    },
    unitPrice: {
        type: Number
    },
    quantity: {
        type: Number
    },
    serviceChargePercentage: {
        type: Number
    },
    gstPercentage: {
        type: Number
    },
    serviceCharge: {
        type: Number,
        default: function() {
            return ((this.unitPrice * this.quantity) * (this.serviceChargePercentage / 100)).toFixed(0);
        }        
    },
    gstCharge: {
        type: Number,
        default: function() {
            return ((this.unitPrice * this.quantity) * (this.gstPercentage / 100)).toFixed(0);
        }        
    },
    totalPrice: {
        type: Number,
        default: function() {
            return ((this.unitPrice * this.quantity) + this.serviceCharge + this.gstCharge).toFixed(0);
        }        
    },
    orderDate: { 
        type: Date,
        default: function() {
            return new Date();
        }

        // type: String,
        // default: function() {
        //     return date.format(new Date(), "YYYY-MM-DD");
        // }
    },
    // orderTime: { 
    //     type: String,
    //     default: function() {
    //         return date.format(new Date(), "HH:mm");
    //     }
    // },
    despatchDate: { 
        type: Date
        // type: String
    },
    // despatchTime: { 
    //     type: String 
    // }
});

const miscellaneousSchema = new mongoose.Schema({
    id: {
        type: String
    },
    name: {
        type: String
    },
    unitPrice: {
        type: Number
    },
    quantity: {
        type: Number,
    },
    serviceChargePercentage: {
        type: Number
    },
    gstPercentage: {
        type: Number
    },
    serviceCharge: {
        type: Number,
        default: function() {
            return ((this.unitPrice * this.quantity) * (this.serviceChargePercentage / 100)).toFixed(0);
        }        
    },
    gstCharge: {
        type: Number,
        default: function() {
            return ((this.unitPrice * this.quantity) * (this.gstPercentage / 100)).toFixed(0);
        }        
    },
    totalPrice: {
        type: Number,
        default: function() {
            return ((this.unitPrice * this.quantity) + this.serviceCharge + this.gstCharge).toFixed(0);
        }        
    },
    orderDate: {
        type: Date,
        default: function() {
            return new Date();
        }

        // type: String,
        // default: function() {
        //     return date.format(new Date(), "YYYY-MM-DD");
        // }
    },
    // orderTime: { 
    //     type: String,
    //     default: function() {
    //         return date.format(new Date(), "HH:mm");
    //     }
    // },
    despatchDate: { 
        // type: String
        type: Date
    },
    // despatchTime: { 
    //     type: String 
    // }    
});

const roomTransactionSchema = new mongoose.Schema({
    rooms: [roomSchema],
    isCheckedout: false
});

const tableTransactionSchema = new mongoose.Schema({
    tables: [tableSchema],
    foods: [foodSchema],
    isCheckedout: false
});

const serviceTransactionSchema = new mongoose.Schema({
    services: [serviceSchema],
    isCheckedout: false
});

const miscellaneousTransactionSchema = new mongoose.Schema({
    miscellanea: [miscellaneousSchema],
    isCheckedout: false
});

const expensesPaymentsTransactionSchema = new mongoose.Schema({
    billNo: {
        type: Number
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
            return this.expenseAmount ? this.expenseAmount.toFixed(0) : 0
        }        
    },
    paymentAmount: {
        type: Number,
        default: function() {
            return this.paymentAmount ? this.paymentAmount.toFixed(0) : 0
        }        
    },
    narration: {
        type: String
    },
    paymentStatus: {
        type: Boolean,
        default: false        
    },
    transactionDate: {
        type: Date,
        default: function() {
            return new Date();
        }

        // type: String,
        // default: function() {
        //     return date.format(new Date(), "YYYY-MM-DD")
        // }        
    },
    // transactionTime: {
    //     type: String,
    //     default: function() {
    //         return date.format(new Date(), "HH:mm")
    //     }        
    // }
});

const guestSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, "Invalid hotel!"]
    },
    idDocumentId: {
        type: String
    },
    idNo: {
        type: String,
        minLength: [6, "Invalid id no!"],
        maxLength: [100, "Invalid id no!"]
    }, 
    name: {
        type: String,
        minLength: [3, "Invalid name!"],
        maxLength: [100, "Invalid name!"],
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
        minLength: [3, "Invalid name!"],
        maxLength: [100, "Invalid name!"]
    }, 
    address: {
        type: String,
        minLength: [3, "Invalid address!"],
        maxLength: [1020, "Invalid address!"]
    }, 
    city: {
        type: String,
        minLength: [3, "Invalid city!"],
        maxLength: [100, "Invalid city!"]
    },
    policeStation: {
        type: String,
        minLength: [3, "Invalid p.s!"],
        maxLength: [100, "Invalid p.s!"]
    },
    state: {
        type: String,
        minLength: [3, "Invalid state!"],
        maxLength: [100, "Invalid state!"]
    },
    pin: {
        type: String,
        minLength: [6, "Invalid pin!"],
        maxLength: [10, "Invalid pin!"]
    },
    mobile: {
        type: String,
        minLength: [10, "Invalid mobile no!"],
        maxLength: [10, "Invalid mobile no!"],
        validate(value) {
            if (value ===  "" || value ===  null) {
                throw new Error("Mobile no. require!");
            }
       }
    },
    email: {
        type: String,
        minLength: [6, "Invalid email!"],
        maxLength: [160, "Invalid email!"],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email!"]
    },
    guestCount: {
        type: Number,
        default: 0,
        min: [1, "Invalid no. of guest!"]
    },
    guestMaleCount: {
        type: Number
    },
    guestFemaleCount: {
        type: Number
    },
    corporateName: {
        type: String
    }, 
    corporateAddress: {
        type: String
    },
    gstNo: {
        type: String
    },
    dayCount: {
        type: Number,
        default: 1,
        min: [1, "Invalid no. of day!"]
    },
    bookingAgentId: {
        type: String
    },
    planId: {
        type: String
    },
    roomsDetail: [roomTransactionSchema],
    tablesDetail: [tableTransactionSchema],
    miscellaneaDetail: [miscellaneousTransactionSchema],
    servicesDetail: [serviceTransactionSchema],
    expensesPaymentsDetail: [expensesPaymentsTransactionSchema],
    balance: {
        type: Number,
        default: function() {
            return this.balance ? this.balance.toFixed(0) : 0
        }        
    },
    inDate: {
        type: Date,
        default: function() {
            return new Date();
        }

        // type: String,
        // default: function() {
        //     return date.format(new Date(), "YYYY-MM-DD")
        // }        
    },
    // inTime: {
    //     type: String,
    //     default: function() {
    //         return date.format(new Date(), "HH:mm")
    //     }        
    // },
    outDate: {
        type: Date
        // type: String
    },
    // outTime: {
    //     type: String
    // },
    option: {
        type: String,
        required: [true, "option require!"]
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