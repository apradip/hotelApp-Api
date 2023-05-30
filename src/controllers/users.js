const Employee = require("../models/employees");

const handelFind = async (req, res) => {
    try {
        const {hotelId, search} = req.params;

        if (search) {
            const data = await Employee.find({hotelId, isEnable: true})
                                        .sort("name, email, mobile")                                
                                        .select("hotelId accessLevels _id name address mobile email").exec();

            if (!data) return res.status(404).send();
            
            const filterData = await Employee.findOne({hotelId, isEnable: true, 
                                                    $or: [{name: {$regex: '.*' + search + '.*'}},
                                                          {email: {$regex: '.*' + search + '.*'}}, 
                                                          {mobile: {$regex: '.*' + search + '.*'}}]})
                                                .sort("name, email, mobile")                                
                                                .select("hotelId accessLevels _id name address mobile email").exec();
            if (!filterData) return res.status(404).send();
            return res.status(200).send(filterData);        
        }
    
        return res.status(404).send("");
    } catch(e) {
        return res.status(500).send(e);
    }
};

module.exports = {handelFind};