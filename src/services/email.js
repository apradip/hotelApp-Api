const nodemailer = require("nodemailer");
const EMAIL_SETTINGS = require("../config/emailOptions");

async function sendOtpEmail(to, otp) {
  try {
    let transporter = createTransport(EMAIL_SETTINGS.EMAIL_SETTINGS);

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: EMAIL_SETTINGS.EMAIL_SETTINGS.auth.user,
        to: to,
        subject: `HotelApp OTP is ${otp}`,
        html: `<div
                  class="container"
                  style="max-width: 90%; margin: auto; padding-top: 20px">
                  <h2>Welcome to the club.</h2>
                  <h4>You are officially In ✔</h4>
                  <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
                  <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${otp}</h1>
              </div>`
    });
    
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

module.exports = sendOtpEmail;