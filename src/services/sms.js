const https = require("https");
const SMS_SETTINGS = require("../config/smsOptions");

async function sendOtpSMS(to, otp) {
  try {
      const options = {
        hostname: SMS_SETTINGS.SMS_SETTINGS.host,
        port: SMS_SETTINGS.SMS_SETTINGS.port,
        path: SMS_SETTINGS.SMS_SETTINGS.path,
        method: SMS_SETTINGS.SMS_SETTINGS.method,
        headers: SMS_SETTINGS.SMS_SETTINGS.headers
      };
    
      const data = "module=" + SMS_SETTINGS.SMS_SETTINGS.module +
                  "&apikey=" + SMS_SETTINGS.SMS_SETTINGS.apiKey +
                  "&to=" + to +
                  "&from=" + SMS_SETTINGS.SMS_SETTINGS.templateId +
                  "&msg=Your OTP for Banglar Para Baithak App login is " + otp + ". Please login using this OTP and do not share it with other. - P&RD Department -PRD Department";

      const req = await https.request(options, (res) => {
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

      // const options = {
      //     host: SMS_SETTINGS.SMS_SETTINGS.host,
      //     port: SMS_SETTINGS.SMS_SETTINGS.port,
      //     path: SMS_SETTINGS.SMS_SETTINGS.path + "?otp=" + otp + "&authkey=" + SMS_SETTINGS.SMS_SETTINGS.apiKey + "&mobile=" + to + "&template_id=" + SMS_SETTINGS.SMS_SETTINGS.templateId
      // };

    //   const callback = function(response) {
    //     let str = "";

    //     response.on("data", function (chunk) {
    //       str += chunk;
    //     });

    //     response.on("end", function () {
    //       const obj = JSON.parse(str);
    //       if (obj.type === "success") {
    //         return true;
    //       } else {
    //         return false;
    //       }
    //     });
    // }

    // var req = http.request(options, callback);
    // req.end();
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = sendOtpSMS;