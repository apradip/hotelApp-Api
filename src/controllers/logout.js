const Employee = require("../models/employees");

const handelLogout = async (req, res) => {
    // On client, also delete the accessToken
    const {hotelId, _id} = req.params;
    
    // Is refreshToken in db?
    const foundEmployee = await Employee.findOne({hotelId, isEnable: true, _id}).exec();
    if (!foundEmployee) {
        return res.sendStatus(404);
    }

    // Delete refreshToken in db
    foundEmployee.refreshToken = "";
    const result = await foundEmployee.save();

    res.sendStatus(200);
}

module.exports = {handelLogout};