const bcrypt = require("bcrypt");
const Employee = require("../models/employees");


//change password
//query string : / hotel id / user id 
//body : { "oldPassword" : "", "newPassword" : "" }
const handelChangePassword = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const {oldPassword, newPassword} = req.body;
        const data = await Employee.findOne({hotelId, isEnable: true, _id}).exec();
        if (!data) return res.status(404).send("User not found"); //Not found

        if (data.password !== "" && newPassword !== "") {
            const matchOldPassword = await compare(oldPassword, data.password);
            if (!matchOldPassword) return res.status(405).send("Old password dosen't match");
        }

        const password = await bcrypt.hash(newPassword, 10);
        const resChangePassword = await Employee.findByIdAndUpdate(_id, {password, otp: null, expiration_time: null, refreshToken: null}).exec();
        if (!resChangePassword) return res.status(400).send(resChangePassword);

        return res.status(200).send();
    } catch(e) {
        return res.status(500).send(e);
    }
};

module.exports = {handelChangePassword};