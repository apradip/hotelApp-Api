const { logEvents } = require('./logEvents');

const errorHandler = (err, req, res, next) => {
    const date = `${format(new Date(), 'yyyyMMdd')}`;
    logEvents(`${err.name}: ${err.message}`, 'errLog_' + date + '.txt');
    // console.error(err.stack)
    res.status(500).send(err.message);
}

module.exports = errorHandler;