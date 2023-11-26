const Employee = require("../models/employees");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//handel login with password
//query string : hotelId
//body : {"userName" : "", "password" : ""}
const handleLogin = async (req, res) => {
    console.log("handleLogin");

    const hotelId = req.params.hotelId;
    const {userName, password} = req.body;
    let foundEmployee;

    console.log("userName : " + userName);
    console.log("password : " + password);


    if (!userName || !password) return res.status(400).json({message: "Mobile no. and password are required."});

    if (parseInt(userName)) {
        foundEmployee = await Employee.findOne({hotelId, isEnable: true, mobile: parseInt(userName.trim())}).exec();
    } else {
        foundEmployee = await Employee.findOne({hotelId, isEnable: true, email: userName.trim()}).exec();    
    }

    if (!foundEmployee) return res.sendStatus(401);

    // evaluate password 
    const matchEmployee = await bcrypt.compare(password, foundEmployee.password);

    if (matchEmployee) {
        var employeeRoles = [];

        for (let i = 0; i < foundEmployee.accessLevels.length; i++) {
            employeeRoles.push(foundEmployee.accessLevels[i].id);
        }

        if (employeeRoles.length > 0) {
            // create JWTs
            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        userid: foundEmployee._id,
                        username: foundEmployee.name,
                        roles: employeeRoles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: "1h"}
            );

            const refreshToken = jwt.sign(
                {username: foundEmployee.name},
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn: "1d"}
            );

            // Saving refreshToken with current user
            foundEmployee.refreshToken = refreshToken;
            const result = await foundEmployee.save();
            res.json({accessToken, refreshToken});
        } else {
            res.sendStatus(401);   
        }
    } else {
        res.sendStatus(401);
    }
};

//handel login with otp
//query string : hotelId
//body : {"userName" : "", "otp" : ""}
const handelOtpLogin = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const {userName, otp} = req.body;
        let foundEmployee;

        if (!userName) return res.status(400).json({message: "Mobile no. or email is required."});
        if (!otp) return res.status(400).json({message: "OTP is required."});

        if (parseInt(userName)) {
            foundEmployee = await Employee.findOne({hotelId, isEnable: true, mobile: parseInt(userName.trim())}).exec();
        } else {
            foundEmployee = await Employee.findOne({hotelId, isEnable: true, email: userName.trim()}).exec();    
        }

        if (!foundEmployee) return res.sendStatus(400);

        // evaluate password 
        const matchEmployee = await bcrypt.compare(otp, foundEmployee.otp);

        if (matchEmployee) {
            const currentDateTime = new Date();
            const exporyDateTime = new Date(foundEmployee.expiration_time);

            if (currentDateTime.getTime() > exporyDateTime.getTime()) {
                return res.sendStatus(401).send("OTP expire."); //Unauthorized 
            }

            let employeeRoles = [];

            for (let i = 0; i < foundEmployee.accessLevels.length; i++) {
                employeeRoles.push(foundEmployee.accessLevels[i].id);
            }
    
            if (employeeRoles.length > 0) {
                // create JWTs
                const accessToken = jwt.sign(
                    {
                        UserInfo: {
                            userid: foundEmployee._id,
                            username: foundEmployee.name,
                            roles: employeeRoles
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: "1h" }
                );

                const refreshToken = jwt.sign(
                    {username: foundEmployee.name },
                    process.env.REFRESH_TOKEN_SECRET,
                    {expiresIn: "1d"}
                );

                // Saving refreshToken with current user
                foundEmployee.refreshToken = refreshToken;
                foundEmployee.password = "";
                foundEmployee.otp = "";
                foundEmployee.expiration_time = null;

                const result = await foundEmployee.save();

                // Creates Secure Cookie with refresh token
                // res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

                // Send authorization roles and access token to user
                res.json({ accessToken, refreshToken });
            } else {
                res.sendStatus(401);    
            }
        } else {
            res.sendStatus(401);
        }
    } catch (e) {
        return res.status(400).send(e);
    };
};

module.exports = {handleLogin, handelOtpLogin};