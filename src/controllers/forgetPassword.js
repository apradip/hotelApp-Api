const Employee = require("../models/employees");
const bcrypt = require("bcrypt");
const {generateOTP, AddMinutesToDate} = require("../services/otp");
const sendOtpEmail = require("../services/email");
const sendOtpSMS = require("../services/sms");

//handel forfet password
//query string : hotelId
//body : {"userName" : ""}
const handelSendOtp = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const userName = req.body.userName;
        if (!userName) return res.status(400).json({"message": "Mobile no. or email is required."});

        let foundEmployee;

        if (parseInt(userName)) {
            foundEmployee = await Employee.findOne({hotelId, isEnable: true, mobile: parseInt(userName.trim())}).exec();
        } else {
            foundEmployee = await Employee.findOne({hotelId, isEnable: true, email: userName.trim()}).exec();
        }

        if (!foundEmployee) return res.sendStatus(401); //Unauthorized 

        //generate otp
        const otp = generateOTP();
        // console.log(otp);

        //save to db
        foundEmployee.otp = await bcrypt.hash(otp.toString().trim(), 10);
        foundEmployee.expiration_time = AddMinutesToDate(new Date(), 10);
        const resUpdate = await foundEmployee.save();
        if (!resUpdate) return res.status(400).send();

        //send by the email
        const emailStatus = await sendOtpEmail(foundEmployee.email, otp);
        if (!emailStatus) return res.status(400).send();

        //send by the sms 
        const smsStatus = await sendOtpSMS(foundEmployee.mobile, otp);
        if (smsStatus !== "undefined" && smsStatus === false) return res.status(400).send();

        return res.status(200).send("OTP successfully send.");
    } catch (e) {
        console.log(e);
        return res.status(400).send(e);
    }
}

module.exports = {handelSendOtp};