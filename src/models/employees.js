const mongoose = require("mongoose");
// const validator = require("validator");

const employeeSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
    }, 
    accessLevels: [
        {
            id: {
                type: String, 
                required: [true, 'Invalid access level!']
            },
            name: {
                type: String, 
                required: [true, 'Invalid access level!']
            }
        }
    ], 
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
    mobile: {
        type: String,
        minLength: [3, 'Invalid mobile no!'],
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
    password: {
        type: String,
        default: null
    },
    otp: {
        type: String,
        default: null
    },
    expiration_time: {
        type: Date,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    },
    isEnable: {
        type: Boolean,
        default: true
    }
});

const Employee = new mongoose.model("Employee", employeeSchema);
module.exports = Employee;