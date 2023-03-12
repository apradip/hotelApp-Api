const mongoose = require("mongoose");
const date = require("date-and-time");
const validator = require("validator");

const guestExpensesPaymentsSchema = new mongoose.Schema({
    hotelId: {
        type: String,
        required: [true, 'Invalid data!']
    },
    guestId: {
        type: String, 
        required: [true, 'Invalid guest!']
    },
    expenseAmount: {
        type: Number,
        default: 0,
        required: [true, 'Expense amount require!'],
    },
    paymentAmount: {
        type: Number,
        default: 0,
        required: [true, 'Payment amount require!'],
    },
    narration: {
        type: String, 
        required: [true, 'Invalid narration!']
    },
    transactionDate: {
        type: Date,
        default: date.format(new Date(),'YYYY-MM-DD'),
        required: [true, 'Expense/Payment date require!'],
    },
    transactionTime: {
        type: String,
        default: date.format(new Date(),'HH:mm'),
        required: [true, 'Expense/Payment time require!'],
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

const GuestExpensePayment = new mongoose.model('GuestExpensePayment', guestExpensesPaymentsSchema);

module.exports = GuestExpensePayment;