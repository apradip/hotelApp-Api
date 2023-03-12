const Guest = require("../models/guests");


//handel search guest
//query string : hotel Id?search= guest name, father name, mobile, address, city, police station, state, pin 
const handelSearch = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const search = req.query.search;
        const data = await Guest.find({hotelId, isEnable: true })
                                        .sort("name")                                
                                        .select("_id idDocumentId idNo name age fatherName address city policeStation state pin phone mobile email guestCount guestMaleCount guestFemaleCount bookingAgentId planId corporateName corporateAddress gstNo roomNos checkInDate checkInTime dayCount checkOutDate checkOutTime isCheckedOut").exec();
        if (!data) return res.status(404).send();

        if (search) {
            const filterData = await Guest.find({isEnable: true, 
                                                 $or: [{name: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {fatherName: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {address: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {city: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {policeStation: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {state: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {pin: {$regex: ".*" + search.trim() + ".*"}},
                                                 {mobile: {$regex: ".*" + search.trim() + ".*"}}]})
                                                .sort("name")                                
                                                .select("_id idDocumentId idNo name age fatherName address city policeStation state pin phone mobile email guestCount guestMaleCount guestFemaleCount bookingAgentId planId corporateName corporateAddress gstNo roomNos checkInDate checkInTime dayCount checkOutDate checkOutTime isCheckedOut").exec();
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel detail guest
//query string : hotel Id / _Id
const handelDetail = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Guest.findOne({hotelId, isEnable: true, _id}).exec();
        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel add guest
//query string : hotel Id
//body : {"idDocumentId" : "", "idNo" : "", "name" : "", "age" : 0, "fatherName" : "", "address" : "", "city" : "", "policeStation" : "", "state" : "",
//        "pin" : "", "phone" : "", "mobile" : "", "email" : "", "guestCount" : 0, "guestMaleCount" : 0, "guestFemaleCount" : 0,
//        "dayCount" : 0, "bookingAgentId" : "", "planId" : "", "corporateName" : "", "corporateAddress" : "", "gstNo" : "",
//        "checkInDate" : "", "checkInTime" : ""}
const handelCreate = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const {idDocumentId, idNo, name, age, fatherName, address, city, policeStation, state, 
               pin, phone, mobile, email, guestCount, guestMaleCount, guestFemaleCount, 
               dayCount, bookingAgentId, planId, corporateName, corporateAddress, gstNo, 
               checkInDate, checkInTime} = req.body;
        const data = new Guest({hotelId,
                                idDocumentId,
                                idNo: idNo.trim().toUpperCase(), 
                                name: name.trim().toUpperCase(), 
                                age,
                                fatherName: fatherName.trim().toUpperCase(),
                                address: address.trim().toUpperCase(),
                                city: city.trim().toUpperCase(),
                                policeStation: policeStation.trim().toUpperCase(),
                                state: state.trim().toUpperCase(),
                                pin: pin.trim(),
                                phone,
                                mobile,
                                email,
                                guestCount,
                                guestMaleCount,
                                guestFemaleCount,
                                dayCount, 
                                bookingAgentId, 
                                planId, 
                                corporateName, 
                                corporateAddress, 
                                gstNo, 
                                checkInDate,
                                checkInTime});

        const resAdd = await data.save();
        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
}


//handel update guest
//query string : hotel Id / _Id
//body : {"idDocumentId" : "", "idNo" : "", "name" : "", "age" : 0, "fatherName" : "", "address" : "", "city" : "", "policeStation" : "", "state" : "",
//        "pin" : "", "phone" : "", "mobile" : "", "email" : "", "guestCount" : 0, "guestMaleCount" : 0, "guestMaleCount" : 0, "guestFemaleCount" : 0,
//        "dayCount" : 0, "bookingAgentId" : "", "planId" : "", "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
const handelUpdate = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const {idDocumentId, idNo, name, age, fatherName, address, city, policeStation, state, 
               pin, phone, mobile, email, guestCount, guestMaleCount, guestFemaleCount, 
               dayCount, bookingAgentId, planId, corporateName, corporateAddress, gstNo} =  req.body;
        const data = await Guest.findOne({hotelId, isEnable: true, _id}).exec();
        if (!data) return res.status(404).send();

        const resUpdate = await Guest.findByIdAndUpdate(_id, 
                                                            {idDocumentId,
                                                             idNo: idNo.trim().toUpperCase(), 
                                                             name: name.trim().toUpperCase(), 
                                                             age,
                                                             fatherName: fatherName.trim().toUpperCase(),
                                                             address: address.trim().toUpperCase(),
                                                             city: city.trim().toUpperCase(),
                                                             policeStation: policeStation.trim().toUpperCase(),
                                                             state: state.trim().toUpperCase(),
                                                             pin: pin.trim(),
                                                             phone,
                                                             mobile,
                                                             email,
                                                             guestCount,
                                                             guestMaleCount,
                                                             guestFemaleCount,
                                                             dayCount, 
                                                             bookingAgentId, 
                                                             planId, 
                                                             corporateName, 
                                                             corporateAddress, 
                                                             gstNo}).exec();
        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel delete guest
//query string : hotel Id / _Id
const handelRemove = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Guest.findOne({hotelId, isEnable: true, _id}).exec();
        if (!data) return res.status(404).send();

        const resDelete = await Guest.findByIdAndUpdate(_id, {isEnable: false}).exec();
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