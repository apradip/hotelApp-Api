const RoomCategory = require("../models/roomCategories");

//handel search room category
//query string : /hotel Id?search= room category name
const handelSearch = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const search = req.query.search;
        const data = await RoomCategory.find({hotelId, isEnable: true})
                                        .sort("name")                                
                                        .select("hotelId _id name tariff maxDiscount extraBedTariff extraPersonTariff");
        if (!data) return res.status(404).send();

        if (search) {
            const filterData = await RoomCategory.find({hotelId, isEnable: true, name: {$regex: ".*" + search.trim().toUpperCase() + ".*"}})
                                                .sort("name")                                
                                                .select("hotelId _id name tariff maxDiscount extraBedTariff extraPersonTariff");

            if (!filterData) return res.status(404).send();
            return res.status(200).send(filterData);        
        }
    
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel detail room category
//query string : hotel Id / room category Id
const handelDetail = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await RoomCategory.findOne({hotelId, isEnable: true, _id});
        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel add room category
//query string : hotel Id
//body : { "name" : "", "tariff" : 0, "maxDiscount" : 0, "extraBedTariff" : 0, "extraPersonTariff" : 0 }
const handelCreate = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const {name, tariff, maxDiscount, extraBedTariff, extraPersonTariff} = req.body;
        const data = new RoomCategory({
            hotelId,
            name: name.trim().toUpperCase(),
            tariff,
            maxDiscount,
            extraBedTariff,
            extraPersonTariff
        });

        const duplicate = await RoomCategory.find({hotelId, isEnable: true, name});
        if (duplicate.length !== 0) return res.status(409).send("Category already exists!");

        const resAdd = await data.save();
        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
};


//handel update room category
//query string : hotel Id / room category Id
//body : { "name" : "", "tariff" : 0, "maxDiscount" : 0, "extraBedTariff" : 0, "extraPersonTariff" : 0 }
const handelUpdate = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const {name, tariff, maxDiscount, extraBedTariff, extraPersonTariff} = req.body;
        const data = await RoomCategory.findOne({hotelId, isEnable: true, _id});
        if (!data) return res.status(404).send();

        const duplicate = await RoomCategory.find({hotelId, isEnable: true, name: name.trim().toUpperCase()});
        if (duplicate.length > 0) {
            duplicate.map((item) => {
                if (item._id.toString() !== _id) {
                    return res.status(409).send("Category already exists!");
                }
            })
        }

        const resUpdate = await RoomCategory.findByIdAndUpdate(_id, {name: name.trim().toUpperCase(), tariff, maxDiscount, extraBedTariff, extraPersonTariff});
        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel delete room catecory
//query string : hotel Id / room category Id
const handelRemove = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await RoomCategory.findOne({hotelId, isEnable: true, _id});
        if (!data) return res.status(404).send();

        const resDelete = await RoomCategory.findByIdAndUpdate(_id, {isEnable: false});
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