const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            if (allowedOrigins.indexOf("*") !== -1) {
                callback(null, true);
            } else {
                console.log("false");
                callback(new Error("Not allowed by CORS..."));
            }
        }
    },
    optionsSuccessStatus: 200
};

module.exports = corsOptions;