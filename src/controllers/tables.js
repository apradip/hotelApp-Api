const Table = require("../models/tables");


//handel search table
//option [E = empty / else all]
//query string : hotel Id?search= table no
const handelSearch = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const option = req.query.option;
        const search = req.query.search;
        let data = [];

        if (option === "E") {
            data = await Table.find({hotelId, isEnable: true, isOccupied: false})
                                     .sort("no")                                
                                     .select("hotelId _id no accommodation description guestId guestCount isOccupied");
        } else {
            data = await Table.find({hotelId, isEnable: true})
                                     .sort("no")                                
                                     .select("hotelId _id no accommodation description guestId guestCount isOccupied");
        }

        if (!data) return res.status(404).send();

        if (search) {
            const filterData = await Table.find({hotelId, isEnable: true, no: {$regex: ".*" + search.trim().toUpperCase() + ".*"}})
                                                .sort("no")                                
                                                .select("hotelId _id no accommodation description guestId guestCount isOccupied");
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }
    
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel detail table
//query string : hotel Id / table Id
const handelDetail = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Table.findOne({hotelId, isEnable: true, _id});

        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel add table
//query string : hotel Id
//body : { "no" : "", "accommodation" : 0, "description" : "" }
const handelCreate = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const {no, accommodation, description} =  req.body;
        const data = new Table({
            hotelId,
            no: no.trim().toUpperCase(),
            accommodation: accommodation,
            description: description.length > 0 ? description.trim() : "", 
        });

        const duplicate = await Table.find({hotelId, isEnable: true, no});
        if (duplicate.length !== 0) return res.status(409).send("Table already exists!");

        const resAdd = await data.save();
        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
};


//handel update table
//query string : hotel Id / table Id
//body : { "no" : "", "accommodation" : 0, "description" : "" }
const handelUpdate = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const {no, accommodation, description} =  req.body;
        const data = await Table.findOne({hotelId, isEnable: true, _id});
        if (!data) return res.status(404).send();

        const duplicate = await Table.find({hotelId, isEnable: true, no: no.trim().toUpperCase()});
        if (duplicate.length > 0) {
            duplicate.map((item) => {
                if (item._id.toString() !== _id) {
                    return res.status(409).send("Table already exists!");
                }
            })
        }

        const resUpdate = await Table.findByIdAndUpdate(_id, {no: no.trim().toUpperCase(), 
                                                                accommodation: accommodation,
                                                                description: description.length > 0 ? description.trim() : ""});
        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel delete table
//query string : hotel Id / table Id
const handelRemove = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Table.findOne({hotelId, isEnable: true, _id});

        if (!data) return res.status(404).send();

        const resDelete = await Table.findByIdAndUpdate(_id, {isEnable: false});
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