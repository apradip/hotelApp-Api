const { OTP_LENGTH, OTP_DIGITS } = require("../config/otpOptions");

function generateOTP() {
    let otp = "";

    for(let i = 1; i <= OTP_LENGTH; i++) {
        let index = Math.floor(Math.random()*(OTP_DIGITS.length));
        otp = otp + OTP_DIGITS[index];
    }

    return otp;
}

function AddMinutesToDate(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

module.exports = {generateOTP, AddMinutesToDate};