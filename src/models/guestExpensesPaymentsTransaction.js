const mongoose = require("mongoose");
const validator = require("validator");
const date = require("date-and-time");

const guestExpensesPaymentsTransactionSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid hotel!']
    },
    guestId: {
        type: String, 
        required: [true, 'Invalid guest!']
    },
    billNo: {
        type: String
    },
    type: {
        type: String, 
        required: [true, 'Invalid type!']
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
        type: String, 
        required: [true, 'Invalid narration!']
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

const GuestExpensePaymentTransaction = new mongoose.model("GuestExpensePaymentTransaction", guestExpensesPaymentsTransactionSchema);
module.exports = GuestExpensePaymentTransaction;