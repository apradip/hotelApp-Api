const {logEvents} = require("./logEvents");
const {format} = require("date-fns");

const errorHandler = (err, req, res, next) => {
    const date = `${format(new Date(), "yyyyMMdd")}`;
    logEvents(`${err.name}: ${err.message}`, "errLog_" + date + ".txt");
    res.status(500).send(err.message);
};

module.exports = errorHandler;