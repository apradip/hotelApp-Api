const mongoose = require("mongoose");
const validator = require("validator");

const guestSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid data!']
    },
    idDocumentId: {
                type: String, 
                required: [true, 'Invalid id document!']
    },
    idNo: {
        type: String,
        minLength: [6, 'Invalid id no!'],
        maxLength: [100, 'Invalid id no!'],
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("ID No. require!");
            }
       }
    }, 
    name: {
        type: String,
        minLength: [6, 'Invalid name!'],
        maxLength: [100, 'Invalid name!'],
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("Name require!");
            }
       }
    }, 
    age: {
        type: Number,
        default: 0,
        required: [true, 'Age require!'],
        min: [1, 'Invalid age!'],
    },
    fatherName: {
        type: String,
        minLength: [6, 'Invalid name!'],
        maxLength: [100, 'Invalid name!'],
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("Name require!");
            }
       }
    }, 
    address: {
        type: String,
        minLength: [3, 'Invalid address!'],
        maxLength: [1020, 'Invalid address!'],
        validate(value) {
            if (value ===  "" || value ===  null) {
                throw new Error("Address require!");
            }
       }
    }, 
    city: {
        type: String,
        minLength: [3, 'Invalid city!'],
        maxLength: [100, 'Invalid city!'],
        validate(value) {
            if (value ===  "" || value ===  null) {
                throw new Error("City require!");
            }
       }
    },
    policeStation: {
        type: String,
        minLength: [3, 'Invalid p.s!'],
        maxLength: [100, 'Invalid p.s!'],
        validate(value) {
            if (value ===  "" || value ===  null) {
                throw new Error("P.S require!");
            }
       }
    },
    state: {
        type: String,
        minLength: [3, 'Invalid state!'],
        maxLength: [100, 'Invalid state!'],
        validate(value) {
            if (value ===  "" || value ===  null) {
                throw new Error("State require!");
            }
       }
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
        validate(value) {
            if (value ===  "" || value ===  null) {
                throw new Error("Email require!");
            }
       },
       match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email!']
    },
    guestCount: {
        type: Number,
        default: 0,
        required: [true, 'No. of guest require!'],
        min: [1, 'Invalid no. of guest!'],
    },
    guestMaleCount: {
        type: Number,
        default: 0,
        required: [true, 'No. of male guest require!'],
        // min: [1, 'Invalid no. of male guest!'],
    },
    guestFemaleCount: {
        type: Number,
        default: 0,
        required: [true, 'No. of female guest require!'],
        // min: [1, 'Invalid no. of female guest!'],
    },
    roomNos: {
        type: String,
        validate(value) {
            if (value === "" || value === null) {
                throw new Error("Room no. require!");
            }
       }
    },
    checkInDate: {
        type: Date,
        default: Date.now,
        required: [true, 'Check in date require!'],
    },
    checkInTime: {
        type: String,
        required: [true, 'Check in time require!'],
    },
    dayCount: {
        type: Number,
        default: 0,
        required: [true, 'No. of day stays require!'],
    },
    bookingAgentId: {
        type: String, 
        required: [true, 'Invalid booking agent!']
    },
    planId: {
        type: String, 
        required: [true, 'Invalid plan!']
    },
    corporateName: {
        type: String,
    //     minLength: [6, 'Invalid corporate name!'],
    //     maxLength: [100, 'Invalid corporate name!'],
    //     validate(value) {
    //         if (value === "" || value === null) {
    //             throw new Error("Corporate name require!");
    //         }
    //    }
    }, 
    corporateAddress: {
        type: String,
    //     minLength: [3, 'Invalid corporate address!'],
    //     maxLength: [1020, 'Invalid corporate address!'],
    //     validate(value) {
    //         if (value ===  "" || value ===  null) {
    //             throw new Error("Corporate address require!");
    //         }
    //    }
    },
    gstNo: {
        type: String,
        // minLength: [15, 'Invalid GST no.!'],
        // maxLength: [15, 'Invalid GST no.!'],
        // validate(value) {
        //     if (value ===  "" || value ===  null) {
        //         throw new Error("State require!");
        //     }
    },
    checkOutDate: {
        type: Date,
        default: Date.now,
        required: [true, 'Check out date require!'],
    },
    totalExpenseAmount: { 
        type: Number, 
        default: 0
    },
    totalPaidAmount: { 
        type: Number, 
        default: 0
    },
    isCheckedOut: {
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

const Guest = new mongoose.model('Guest', guestSchema);

module.exports = Guest;