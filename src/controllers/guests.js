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
//query string : hotel Id / option [D = detail / S = small]
//body detail: {"idDocumentId" : "", "idNo" : "", "name" : "", "age" : 0, "fatherName" : "", "address" : "", "city" : "", "policeStation" : "", "state" : "",
//        "pin" : "", "phone" : "", "mobile" : "", "email" : "", "guestCount" : 0, "guestMaleCount" : 0, "guestFemaleCount" : 0,
//        "dayCount" : 0, "bookingAgentId" : "", "planId" : "", "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
//body small: {"name" : "", "mobile" : "", "guestCount" : 0, "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
const handelCreate = async (req, res) => {
    try {
        const {hotelId, option} = req.params;

        if (option.trim().toUpperCase() === "D") {
            const {idDocumentId, idNo, name, age, fatherName, address, city, policeStation, state, 
                pin, phone, mobile, email, guestCount, guestMaleCount, guestFemaleCount, 
                dayCount, bookingAgentId, planId, corporateName, corporateAddress, gstNo} = req.body;

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
                    option});

            const resAdd = await data.save();
            if (!resAdd) return res.status(400).send();
    
            return res.status(200).send(data);
                            
        } else if (option.trim().toUpperCase() === "S") {
            const {name, mobile, guestCount, corporateName, corporateAddress, gstNo} = req.body;

            const data = new Guest({
                hotelId,
                name: name.trim().toUpperCase(), 
                mobile,
                guestCount,
                corporateName, 
                corporateAddress, 
                gstNo,
                option});

            const resAdd = await data.save();
            if (!resAdd) return res.status(400).send();
    
            return res.status(200).send(data);
        }
    } catch(e) {
        return res.status(500).send(e);
    }
    
    return res.status(404).send();
}

//handel update guest
//query string : hotel Id / _Id / option [D = detail / S = small]
//body detail: {"idDocumentId" : "", "idNo" : "", "name" : "", "age" : 0, "fatherName" : "", "address" : "", "city" : "", "policeStation" : "", "state" : "",
//        "pin" : "", "phone" : "", "mobile" : "", "email" : "", "guestCount" : 0, "guestMaleCount" : 0, "guestMaleCount" : 0, "guestFemaleCount" : 0,
//        "dayCount" : 0, "bookingAgentId" : "", "planId" : "", "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
//body detail: {"name" : "", "mobile" : "", "guestCount" : 0, "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
const handelUpdate = async (req, res) => {
    try {
        const {hotelId, _id, option} = req.params;

        if (option.trim().toUpperCase() === "S") {
            const {name, mobile, guestCount, corporateName, corporateAddress, gstNo} =  req.body;
            const data = await Guest.findOne({hotelId, isEnable: true, _id}).exec();
            if (!data) return res.status(404).send();

            const resUpdate = await Guest.findByIdAndUpdate(_id, 
                {name: name.trim().toUpperCase(), 
                 mobile,
                 guestCount,
                 corporateName, 
                 corporateAddress, 
                 gstNo}).exec();

            if (!resUpdate) return res.status(400).send(resUpdate);

            return res.status(200).send(resUpdate);

        } else if (option.trim().toUpperCase() === "D") {
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
        }
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(404).send();
}

//handel checkout guest
//query string : hotel Id / _Id 
const handelCheckout = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        // check if total expense & total payment is same
        const data = await Guest.findOne({hotelId, isEnable: true, isActive: true, _id}).exec();
        if (!data) return res.status(404).send();

        const resUpdate = await Guest.findByIdAndUpdate(_id, 
            {isActive: false, 
                updatedDate: Date.now}).exec();

        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send();
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
    handelRemove,
    handelCheckout
}