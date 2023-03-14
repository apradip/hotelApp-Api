const Table = require('../models/tables');


//handel search table
//query string : hotel Id?search= table no
const handelSearch = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const search = req.query.search;
        
        const data = await Table.find({hotelId, isEnable: true})
                                        .sort('no')                                
                                        .select('hotelId _id no description isOccupied').exec();
        if (!data) return res.status(404).send();

        if (search) {
            const filterData = await Table.find({hotelId, isEnable: true, no: {$regex: '.*' + search.trim().toUpperCase() + '.*'}})
                                                .sort('no')                                
                                                .select('hotelId _id no description isOccupied').exec();
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }
    
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel detail table
//query string : hotel Id / table Id
const handelDetail = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Table.findOne({hotelId, isEnable: true, _id}).exec();

        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel add table
//query string : hotel Id
//body : { "no" : "", "description" : "" }
const handelCreate = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const {no, description} =  req.body;
        const data = new Table({
            hotelId,
            no: no.trim().toUpperCase(),
            description: description.trim(), 
            isOccupied: false
        });

        const duplicate = await Table.find({hotelId, isEnable: true, no}).exec();
        if (duplicate.length !== 0) return res.status(409).send("Table already exists!");

        const resAdd = await data.save();
        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
}


//handel update table
//query string : hotel Id / table Id
//body : { "no" : "", "description" : "" }
const handelUpdate = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const {no, description, isOccupied} =  req.body;
        const data = await Table.findOne({hotelId, isEnable: true, _id}).exec();
        if (!data) return res.status(404).send();

        const duplicate = await Table.find({hotelId, isEnable: true, no: no.trim().toUpperCase()}).exec();
        if (duplicate.length > 0) {
            duplicate.map((item) => {
                if (item._id.toString() !== _id) {
                    return res.status(409).send("Table already exists!");
                }
            })
        }

        const resUpdate = await Table.findByIdAndUpdate(_id, {
                                                                no: no.trim().toUpperCase(), 
                                                                description: description.trim(), 
                                                                isOccupied}).exec();
        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel delete table
//query string : hotel Id / table Id
const handelRemove = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Table.findOne({hotelId, isEnable: true, _id}).exec();

        if (!data) return res.status(404).send();

        const resDelete = await Table.findByIdAndUpdate(_id, {isEnable: false}).exec();
        if (!resDelete) return res.status(400).send(resDelete);

        return res.status(200).send(resDelete);
    } catch(e) {
        return res.status(500).send(e);
    }
}


module.exports = {
    handelSearch,
    handelDetail,
    handelCreate,
    handelUpdate,
    handelRemove
}