const mongoose = require("mongoose");
const Hotel = require("../models/hotels");

//handel search hotel
//query string : _Id?search= hotel name, address, city, state, pin, phone, email, webSiteUrl, gstNo 
const handelSearch = async (req, res) => {
    try {
        const _id = req.params._id;
        const search = req.query.search;
        const data = await Hotel.find({_id, isEnable: true })
                                        .sort("name")                                
                                        .select("_id name address city state pin phone email webSiteUrl logoUrl gstNo fincialDecimalPlace serviceChargePercentage foodGstPercentage").exec();
        if (!data) return res.status(404).send();

        if (search) {
            const filterData = await Hotel.find({isEnable: true, 
                                                 $or: [{name: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {address: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {city: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {state: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {pin: {$regex: ".*" + search.trim() + ".*"}},
                                                 {phone: {$regex: ".*" + search.trim() + ".*"}},
                                                 {email: {$regex: ".*" + search.trim() + ".*"}},
                                                 {webSiteUrl: {$regex: ".*" + search.trim() + ".*"}},
                                                 {gstNo: {$regex: ".*" + search.trim() + ".*"}}
                                                ]})
                                                .sort("name")                                
                                                .select("_id name address city state pin phone email webSiteUrl logoUrl gstNo fincialDecimalPlace serviceChargePercentage foodGstPercentage").exec();
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};

//handel detail hotel
//query string : _Id
const handelDetail = async (req, res) => {
    try {
        const {_id} = req.params;
        const data = await Hotel.findOne({_id, isEnable: true}).exec();
        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};

//handel add hotel
//body detail: {"name" : "", "address" : "", "city" : "", "state" : "",
//        "pin" : "", "phone" : "", "email" : "", "webSiteUrl" : "", "logoUrl" : "", "gstNo" : "",
//        "fincialDecimalPlace" : 0, "serviceChargePercentage" : 0, "foodGstPercentage" : 0}
const handelCreate = async (req, res) => {
    try {
        const {name, address, city, state, pin, phone, email, webSiteUrl, logoUrl, gstNo, 
            fincialDecimalPlace, serviceChargePercentage, foodGstPercentage} = req.body;

            const data = new Hotel({hotelId,
                name: name.trim().toUpperCase(), 
                address: address.trim().toUpperCase(),
                city: city.trim().toUpperCase(),
                state: state.trim().toUpperCase(),
                pin: pin.trim(),
                phone,
                email,
                webSiteUrl,
                logoUrl,
                gstNo,
                fincialDecimalPlace, 
                serviceChargePercentage, 
                foodGstPercentage});

            const resAdd = await data.save();
            if (!resAdd) return res.status(400).send();
    
            return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
    
    return res.status(404).send();
};

//handel update hotel
//query string : _Id
//body detail: {"name" : "", "address" : "", "city" : "", "state" : "",
//        "pin" : "", "phone" : "", "email" : "", "webSiteUrl" : "", "logoUrl" : "", "gstNo" : "",
//        "fincialDecimalPlace" : 0, "serviceChargePercentage" : 0, "foodGstPercentage" : 0}
const handelUpdate = async (req, res) => {
    try {
        const {_id} = req.params;
        const {name, address, city, state, pin, phone, email, webSiteUrl, 
            logoUrl, gstNo, fincialDecimalPlace, serviceChargePercentage, 
            foodGstPercentage} =  req.body;
        const data = await Hotel.findOne({_id, isEnable: true}).exec();
        if (!data) return res.status(404).send();

        const resUpdate = await Hotel.findByIdAndUpdate(_id, 
            {name: name.trim().toUpperCase(), 
                name,
                address,
                city, 
                state, 
                pin, 
                phone, 
                email, 
                webSiteUrl, 
                logoUrl, 
                gstNo, 
                fincialDecimalPlace, 
                serviceChargePercentage, 
                foodGstPercentage});

        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);

    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel delete hotel
//query string : _Id
const handelRemove = async (req, res) => {
    try {
        const {_id} = req.params;
        const data = await Hotel.findOne({_id, isEnable: true}).exec();
        if (!data) return res.status(404).send();

        const resDelete = await Hotel.findByIdAndUpdate(_id, {isEnable: false}).exec();
        if (!resDelete) return res.status(400).send(resDelete);

        return res.status(200).send(resDelete);
    } catch(e) {
        return res.status(500).send(e);
    }
};


async function detail (id) {    
    try {   
        const data = await Hotel.findOne({
            _id: mongoose.Types.ObjectId(id), 
            isEnable: true});
        return data;
    } catch(e) {
        throw e;
    }
};

async function getLastBillNo (id) {    
    try {   
        const data = await Hotel.findOne({
            _id: mongoose.Types.ObjectId(id), 
            isEnable: true})

        return data.lastBillNo
    } catch(e) {
        throw e;
    }
};

async function setLastBillNo (id, no) {    
    try {   
        const data = await Hotel.findByIdAndUpdate(mongoose.Types.ObjectId(id), {lastBillNo: no})
    } catch(e) {
        throw e
    }

    return true
};


module.exports = {
    handelSearch,
    handelDetail,
    handelCreate,
    handelUpdate,
    handelRemove,
    detail,
    getLastBillNo,
    setLastBillNo
};