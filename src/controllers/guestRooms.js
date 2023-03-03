const GuestRoom = require("../models/guestRooms");


//handel detail guestRoom
//query string : hotel Id / guest Id
const handelDetail = async (req, res) => {
    try{
        const {hotelId, guestId} = req.params;
        const data = await GuestRoom.find({hotelId, guestId, isEnable: true}).exec();
        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel detail single guestRoom
//query string : hotel Id / guest Id / Id
const handelSingleDetail = async (req, res) => {
    try{
        const {hotelId, guestId, _id} = req.params;
        const data = await GuestRoom.findOne({hotelId, guestId, isEnable: true, _id}).exec();
        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel add guestRoom
//query string : hotel Id / guest Id
//body : {"roomId" : "", "roonNo" : "", "tariff" : 0, "extraBedCount" : 0, "extraBedTariff" : 0,
//        "extraPersonCount" : 0, "extraPersonTariff" : 0, "discount" : 0, "maxDiscount" : 0, "gstPercentage" : 0,
//        "gstAmount" : 0, "price" : 0, "occupancyDate" : ""}
const handelCreate = async (req, res) => {
    try {
        const {hotelId} = req.params;
        const {guestId, roomId, roomNo, tariff, extraBedCount, extraBedTariff, extraPersonCount, extraPersonTariff, 
               discount, maxDiscount, gstPercentage, gstAmount, price, occupancyDate} = req.body;
        const data = new GuestRoom({hotelId,
                                guestId,          
                                roomId,
                                roonNo,
                                tariff,
                                extraBedCount,
                                extraBedTariff,
                                extraPersonCount,
                                extraPersonTariff,
                                discount,
                                maxDiscount,
                                gstPercentage, 
                                gstAmount, 
                                price, 
                                occupancyDate});

        const resAdd = await data.save();
        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
}


//handel delete guestRoom
//query string : hotel Id / guest Id
const handelRemove = async (req, res) => {
    try {
        // const {hotelId, guestId} = req.params;
        // const data = await GuestRoom.find({hotelId, guestId, isEnable: true}).exec();
        // if (!data) return res.status(404).send();

        // const resDelete = await GuestRoom.updateMany(hotelId, guestId, {$set: {isEnable: false}}).exec();
        // if (!resDelete) return res.status(400).send(resDelete);

        return res.status(200).send(resDelete);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel delete guestRoom
//query string : hotel Id / guest Id / Id
const handelSingleRemove = async (req, res) => {
    try {
        const {hotelId, guestId, _id} = req.params;
        const data = await GuestRoom.findOne({hotelId, guestId, isEnable: true, _id}).exec();
        if (!data) return res.status(404).send();

        const resDelete = await GuestRoom.findByIdAndUpdate(_id, {isEnable: false}).exec();
        if (!resDelete) return res.status(400).send(resDelete);

        return res.status(200).send(resDelete);
    } catch(e) {
        return res.status(500).send(e);
    }
}


module.exports = {
    handelDetail,
    handelSingleDetail,
    handelCreate,
    handelRemove,
    handelSingleRemove
}