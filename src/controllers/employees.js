const Employee = require("../models/employees");
const bcrypt = require("bcrypt");

//handel search employee
//query string : /hotel Id?search= employee name
const handelSearch = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const search = req.query.search;

        const data = await Employee.find({hotelId, isEnable: true})
                                        .sort("name, email, mobile")                                
                                        .select("hotelId accessLevels _id name address mobile email");
        if (!data) return res.status(404).send();

        if (search) {
            const filterData = await Employee.find({hotelId, isEnable: true, 
                                                    $or: [{name: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                          {email: {$regex: ".*" + search.trim().toLowerCase() + ".*"}}, 
                                                          {mobile: {$regex: ".*" + search.trim() + ".*"}}]})
                                                .sort("name, email, mobile")                                
                                                .select("hotelId accessLevels _id name address mobile email");
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }
    
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel detail employee
//query string : hotel Id / employee Id
const handelDetail = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Employee.findOne({hotelId, isEnable: true, _id: _id});

        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel add employee
//query string : hotel Id
//body : {"accessLevel" : [{},{}], "name" : "", "address" : "", "mobile" : "", "email" : ""}
const handelCreate = async (req, res) => {
    try {
        const hotelId = req.params.hotelId.trim();
        const {accessLevels, name, address, mobile, email} = req.body;
        const data = new Employee({
            hotelId: hotelId,
            accessLevels: accessLevels,
            name: name.trim().toUpperCase(),
            address: address.trim().toUpperCase(),
            mobile: mobile,
            email: email.trim().toLowerCase()
        });

        const duplicate = await Employee.find({hotelId, isEnable: true, $or: [{mobile: mobile}, {email: email}]});
        if (duplicate.length !== 0) return res.status(409).send("Employee already exists!");
    
        data.password = await bcrypt.hash(req.body.mobile.toString().trim(), 10);
        const resAdd = await data.save();

        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
};


//handel update employee
//query string : hotel Id / employee Id
//body : {"accessLevels" : "", "name" : "", "address" : "", "mobile" : "", "email" : ""}
const handelUpdate = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const {accessLevels, name, address, mobile, email} = req.body;
        const data = await Employee.findOne({hotelId, isEnable: true, _id});

        if (!data) return res.status(404).send();
            
        const duplicate = await Employee.find({hotelId, isEnable: true, $or: [{mobile: mobile}, {email: email}]});

        if (duplicate.length > 0) {
            duplicate.map((item) => {
                if (item._id.toString() !== _id) {
                    return res.status(409).send("Employee already exists!");
                }
            })
        }
    
        const password = await bcrypt.hash(req.body.mobile.toString().trim(), 10);
        const resUpdate = await Employee.findByIdAndUpdate(_id, {accessLevels, name, address, mobile, email, password, otp: null, expiration_time: null, refreshToken: null});
        
        if (!resUpdate)
            return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel delete employee
//query string : hotel Id / employee Id
const handelRemove = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Employee.findOne({hotelId, isEnable: true, _id});
        if (!data) return res.status(404).send();

        const resDelete = await Employee.findByIdAndUpdate(_id, {isEnable: false, password: "", otp: "", refreshToken: ""});
        if (!resDelete) return res.status(400).send(resDelete);

        return res.status(200).send(resDelete);
    } catch(e) {
        return res.status(500).send(e);
    }
};


module.exports = {
    handelSearch,
    handelDetail,
    handelCreate,
    handelUpdate,
    handelRemove
};