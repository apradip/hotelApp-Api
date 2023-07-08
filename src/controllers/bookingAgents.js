const BookingAgent = require("../models/bookingAgents");


//handel search booking agent
//query string : ?search= boolink agent name
const handelSearch = async (req, res) => {
    try {
        const search = req.query.search;
        const data = await BookingAgent.find({isEnable: true})
                                        .sort("name")                                
                                        .select("_id name description");
        if (!data) return res.status(404).send();

        if (search) {
            const filterData = await BookingAgent.find({isEnable: true, name: { $regex: ".*" + search.trim().toUpperCase() + ".*"}})
                                                .sort("name")                                
                                                .select("_id name description");
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel detail booking agent
//query string : /booking agent Id
const handelDetail = async (req, res) => {
    try{
        const _id = req.params._id;
        const data = await BookingAgent.findOne({isEnable: true, _id});
        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel add booking agent
//body : { "name" : "", "description" : "" }
const handelCreate = async (req, res) => {
    try {
        const {name, description} = req.body;
        const data = new BookingAgent({ 
                                        name: name.trim().toUpperCase(), 
                                        description: description.length > 0 ? description.trim() : ""
                                    });

        const duplicate = await BookingAgent.find({isEnable: true, name});
        if (duplicate.length !== 0) return res.status(409).send("Booking agent already exists!");

        const resAdd = await data.save();
        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
};


//handel update booking agent
//query string : /booking agent Id
//body : { "name" : "", "description" : "" }
const handelUpdate = async (req, res) => {
    try {
        const _id = req.params._id;
        const {name, description} = req.body;
        const data = await BookingAgent.findOne({isEnable: true, _id}).exec();
        if (!data) return res.status(404).send();

        const duplicate = await BookingAgent.find({isEnable: true, $or: [{name: name}]});
        if (duplicate.length > 0) {
            duplicate.map((item) => {
                if (item._id.toString() !== _id) {
                    return res.status(409).send("Booking agent already exists!");
                }
            })
        }

        const resUpdate = await BookingAgent.findByIdAndUpdate(_id, { 
                                                                        name: name.trim().toUpperCase(), 
                                                                        description: description.length > 0 ? description.trim() : ""
                                                                    }).exec();
        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel delete booking agent
//query string : /booking agent Id
const handelRemove = async (req, res) => {
    try {
        const _id = req.params._id;
        const data = await BookingAgent.findOne({isEnable: true, _id});
        if (!data) return res.status(404).send();

        const resDelete = await BookingAgent.findByIdAndUpdate(_id, {isEnable: false});
        if (!resDelete) return res.status(400).send(resDelete);

        return res.status(200).send(resDelete);
    } catch(e) {
        return res.status(500).send(e);
    }
};


async function getName (id) {
    try{
        const data = await BookingAgent.findOne({_id: id, isEnable: true});
        if (!data) return null;

        return data.name;
    } catch(e) {
        return null;
    }
};

module.exports = {
    handelSearch,
    handelDetail,
    handelCreate,
    handelUpdate,
    handelRemove,
    getName
};