const Room = require("../models/rooms");

//handel search room
//query string : hotel Id?option=O occupied else all &search= room no
const handelSearch = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const option = req.query.option;
        const search = req.query.search;
        let data = [];

        if (option === "O") {
            data = await Room.find({hotelId, isEnable: true, isOccupied: true})
                                    .sort("no")                                
                                    .select("hotelId categoryId _id no accommodation guestId guestCount tariff maxDiscount extraBedTariff extraPersonTariff isOccupied");
        } else {   
            data = await Room.find({hotelId, isEnable: true})
                                        .sort("no")                                
                                        .select("hotelId categoryId _id no accommodation guestId guestCount tariff maxDiscount extraBedTariff extraPersonTariff isOccupied");
        }

        // if (!data) return res.status(404).send();

        if (search) {
            const filterData = await Room.find({hotelId, isEnable: true, no: {$regex: ".*" + search.trim().toUpperCase() + ".*"}})
                                                .sort("no")                                
                                                .select("hotelId categoryId _id no accommodation guestId guestCount tariff maxDiscount extraBedTariff extraPersonTariff isOccupied");
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }
    
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel detail room
//query string : hotel Id / room Id
const handelDetail = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Room.findOne({hotelId, isEnable: true, _id});

        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel add room
//query string : hotel Id
//body : { "categoryId" : "", "no" : "", "accommodation" : 0, "tariff" : 0, "maxDiscount" : 0, "extraBedTariff" : 0, "extraPersonTariff" : 0 }
const handelCreate = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const {categoryId, no, accommodation, tariff, maxDiscount, extraBedTariff, extraPersonTariff} =  req.body;
        const data = new Room({
            hotelId,
            categoryId,
            no: no.trim().toUpperCase(),
            accommodation: accommodation,
            tariff: tariff,
            maxDiscount: maxDiscount,
            extraBedTariff: extraBedTariff,
            extraPersonTariff: extraPersonTariff,
            isOccupied: false
        });

        const duplicate = await Room.find({hotelId, isEnable: true, categoryId, no});
        if (duplicate.length !== 0) return res.status(409).send("Room already exists!");

        const resAdd = await data.save();
        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
};


//handel update room
//query string : hotel Id / room Id
//body : { "categoryId" : "", "no" : "", "accommodation" : 0, "tariff" : 0, "maxDiscount" : 0, "extraBedTariff" : 0, "extraPersonTariff" : 0 }
const handelUpdate = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const {categoryId, no, accommodation, tariff, maxDiscount, extraBedTariff, extraPersonTariff, isOccupied} =  req.body;
        const data = await Room.findOne({hotelId, isEnable: true, _id});
        if (!data) return res.status(404).send();

        const duplicate = await Room.find({hotelId, isEnable: true, no: no.trim().toUpperCase()});
        if (duplicate.length > 0) {
            duplicate.map((item) => {
                if (item._id.toString() !== _id) {
                    return res.status(409).send("Room already exists!");
                }
            })
        }

        const resUpdate = await Room.findByIdAndUpdate(_id, {categoryId, 
                                                            no: no.trim().toUpperCase(), 
                                                            accommodation: accommodation,
                                                            tariff, 
                                                            maxDiscount, 
                                                            extraBedTariff, 
                                                            extraPersonTariff, 
                                                            isOccupied});
        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel delete room
//query string : hotel Id / room Id
const handelRemove = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Room.findOne({hotelId, isEnable: true, _id});

        if (!data) return res.status(404).send();

        const resDelete = await Room.findByIdAndUpdate(_id, {isEnable: false});
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