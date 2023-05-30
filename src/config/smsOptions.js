const SMS_SETTINGS = {
    host: process.env.SMS_HOST,
    port: process.env.SMS_PORT,
    path: process.env.SMS_PATH,
    method: process.env.SMS_METHOD,
    module: process.env.SMS_MODULE,
    templateId: process.env.SMS_TEMPLATEID,
    apiKey: process.env.SMS_APIKEY,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    },
};

module.exports = {SMS_SETTINGS};