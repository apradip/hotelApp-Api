const Plan = require("../models/plans");

//handel search plan
//query string : /hotel Id?search= plan name
const handelSearch = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const search = req.query.search;

        const data = await Plan.find({hotelId, isEnable: true})
                                        .sort("name")                                
                                        .select("hotelId _id name description");
        if (!data) return res.status(404).send();

        if (search) {
            const filterData = await Plan.find({hotelId, isEnable: true, name: {$regex: ".*" + search.trim().toUpperCase() + ".*"}})
                                                .sort("name")                                
                                                .select("hotelId _id name description");
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }
    
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel detail plan
//query string : hotel Id / plan Id
const handelDetail = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Plan.findOne({hotelId, isEnable: true, _id});
        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel add plan
//query string : hotel Id
//body : { "name" : "", "description" : "" }
const handelCreate = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const {name, description} = req.body;
        const data = new Plan({ 
            hotelId, 
            name: name.trim().toUpperCase(),
            description: description.length > 0 ? description.trim() : "",
        });

        const duplicate = await Plan.find({hotelId, isEnable: true, name});
        if (duplicate.length !== 0) return res.status(409).send("Plan already exists!");

        const resAdd = await data.save();
        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
};


//handel update plan
//query string : hotel Id / plan Id
//body : { "name" : "", "description" : "" }
const handelUpdate = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const {name, description} = req.body;
        
        const data = await Plan.findOne({hotelId, isEnable: true, _id});
        if (!data) return res.status(404).send();

        const duplicate = await Plan.find({hotelId, isEnable: true, name: name.trim().toUpperCase()});
        if (duplicate.length > 0) {
            duplicate.map((item) => {
                if (item._id.toString() !== _id) {
                    return res.status(409).send("Plan already exists!");
                }
            })
        }

        const resUpdate = await Plan.findByIdAndUpdate(_id, {
                                                            name: name.trim().toUpperCase(), 
                                                            description: description.length > 0 ? description.trim() : ""}).exec();
        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel delete plan
//query string : hotel Id / plan Id
const handelRemove = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Plan.findOne({hotelId, isEnable: true, _id});
        if (!data) return res.status(404).send();

        const resDelete = await Plan.findByIdAndUpdate(_id, {isEnable: false});
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