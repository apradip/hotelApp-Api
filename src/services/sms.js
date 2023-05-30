const https = require("https");
const SMS_SETTINGS = require("../config/smsOptions");

async function sendOtpSMS(to, otp) {
  try {
      const options = {
        hostname: _SMS_SETTINGS.host,
        port: _SMS_SETTINGS.port,
        path: _SMS_SETTINGS.path,
        method: _SMS_SETTINGS.method,
        headers: _SMS_SETTINGS.headers
      };
    
      const data = "module=" + _SMS_SETTINGS.module +
                  "&apikey=" + _SMS_SETTINGS.apiKey +
                  "&to=" + to +
                  "&from=" + _SMS_SETTINGS.templateId +
                  "&msg=Your OTP for Banglar Para Baithak App login is " + otp + ". Please login using this OTP and do not share it with other. - P&RD Department -PRD Department";

      const req = await request(options, (res) => {
        // console.log(`statusCode: ${res.statusCode}`);
      
        res.on("data", (d) => {
          // process.stdout.write(d);
          return true;
        });
      });
    
      req.on("error", (error) => {
        // console.error(error);
        return false;
      });
    
      req.write(data);
      req.end();

    return true;
  } catch (e) {
    return false;
  }
};

module.exports = sendOtpSMS;