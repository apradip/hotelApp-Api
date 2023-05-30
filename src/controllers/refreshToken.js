const Employee = require("../models/employees");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
    const refreshToken = authHeader.split(" ")[1].trim();
    const foundEmployee = await Employee.findOne({ isEnable: true, refreshToken }).exec();
    if (!foundEmployee) return res.sendStatus(403);

    var employeeRoles = [];

    for (let i = 0; i < foundEmployee.accessLevels.length; i++) {
        employeeRoles.push(foundEmployee.accessLevels[i].id);
    }

    if (employeeRoles.length > 0) {
        // evaluate jwt 
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err || foundEmployee.name !== decoded.username) return res.sendStatus(403);
                
                const accessToken = jwt.sign(
                    {
                        UserInfo: {
                            userid: foundEmployee._id,
                            username: decoded.username,
                            roles: employeeRoles
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {expiresIn: "1h"}
                );
    
                const refreshToken = jwt.sign(
                    {username: decoded.username},
                    process.env.REFRESH_TOKEN_SECRET,
                    {expiresIn: "1d"}
                );
    
                // Saving refreshToken with current user
                foundEmployee.refreshToken = refreshToken;
                const result = await foundEmployee.save();

                res.json({accessToken, refreshToken})
            }
        );
    }
};

module.exports = {handleRefreshToken};