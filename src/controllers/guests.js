const Guest = require("../models/guests");

//handel search guest
//query string : hotel Id?search= guest name, father name, mobile, address, city, police station, state, pin 
const handelSearch = async (req, res) => {
    const hotelId = req.params.hotelId;
    const search = req.query.search;

    try {
        const filter1 = {
            $match: {
                hotelId,
                isEnable: true
            }
        }
        const filter2 = {
            $match: {
                $or: [{name: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                {mobile: {$regex: ".*" + search.trim() + ".*"}},
                {corporateName: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                {corporateAddress: {$regex: ".*" + search.trim().toUpperCase() + ".*"}}]
            }
        }
        const filter3 = {
            $sort: {
                name: 1, corporateName: 1
            }
        }
        let pipeline = []

        if (search) {
            pipeline = [filter1, filter2, filter3]
        } else {
            pipeline = [filter1, filter3]
        }

        const data = await aggregate(pipeline)
        if (!data) return res.status(404).send()
        return res.status(200).send(data)

    } catch(e) {
        return res.status(500).send(e);
    }
};

//handel detail guest
//query string : hotel Id / _Id
const handelDetail = async (req, res) => {
    const {hotelId, _id} = req.params

    try {
        const data = await Guest.findOne({hotelId, isEnable: true, _id})
        if (!data) return res.status(404).send()

        return res.status(200).send(data)
    } catch(e) {
        return res.status(500).send(e)
    }
};

//handel add guest
//query string : hotel Id
//body detail: {option [D = detail / S = small],
//        "idDocumentId" : "", "idNo" : "", "name" : "", "age" : 0, "fatherName" : "", "address" : "", "city" : "", "policeStation" : "", "state" : "",
//        "pin" : "", "phone" : "", "mobile" : "", "email" : "", "guestCount" : 0, "guestMaleCount" : 0, "guestFemaleCount" : 0,
//        "dayCount" : 0, "bookingAgentId" : "", "planId" : "", "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
//body small: {"name" : "", "mobile" : "", "guestCount" : 0, "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
const handelCreate = async (req, res) => {
    const {hotelId} = req.params
    const {option} = req.body

    try {
        if (option.trim().toUpperCase() === 'D') {
            const {idDocumentId, idNo, name, age, fatherName, address, city, policeStation, state, 
                pin, phone, mobile, email, guestCount, guestMaleCount, guestFemaleCount, 
                dayCount, bookingAgentId, planId, corporateName, corporateAddress, gstNo} = req.body

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

            const resAdd = await data.save()
            if (!resAdd) return res.status(400).send()
    
            return res.status(200).send(data)
                            
        } else if (option.trim().toUpperCase() === 'S') {
            const {name, mobile, guestCount, corporateName, corporateAddress, gstNo} = req.body

            const data = new Guest({
                hotelId,
                name: name ? name.trim().toUpperCase() : '', 
                mobile,
                guestCount,
                corporateName: corporateName ? corporateName.trim().toUpperCase() : '',
                corporateAddress: corporateAddress ? corporateAddress.trim().toUpperCase() : '', 
                gstNo,
                option})

            const resAdd = await data.save()
            if (!resAdd) return res.status(400).send()
    
            return res.status(200).send(data)
        }
    } catch(e) {
        return res.status(500).send(e)
    }
    
    return res.status(404).send()
};

//handel update guest
//query string : hotel Id / _Id / option [D = detail / S = small]
//body detail: {"idDocumentId" : "", "idNo" : "", "name" : "", "age" : 0, "fatherName" : "", "address" : "", "city" : "", "policeStation" : "", "state" : "",
//        "pin" : "", "phone" : "", "mobile" : "", "email" : "", "guestCount" : 0, "guestMaleCount" : 0, "guestMaleCount" : 0, "guestFemaleCount" : 0,
//        "dayCount" : 0, "bookingAgentId" : "", "planId" : "", "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
//body detail: {"name" : "", "mobile" : "", "guestCount" : 0, "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
const handelUpdate = async (req, res) => {
    const {hotelId, _id, option} = req.params

    try {
        if (option.trim().toUpperCase() === 'S') {
            const {name, mobile, guestCount, corporateName, corporateAddress, gstNo} =  req.body
            const data = await Guest.findOne({hotelId, isEnable: true, _id})
            if (!data) return res.status(404).send()

            const resUpdate = await Guest.findByIdAndUpdate(_id, 
                {name: name.trim().toUpperCase(), 
                 mobile,
                 guestCount,
                 corporateName, 
                 corporateAddress, 
                 gstNo});

            if (!resUpdate) return res.status(400).send(resUpdate)

            return res.status(200).send(resUpdate)

        } else if (option.trim().toUpperCase() === 'D') {
            const {idDocumentId, idNo, name, age, fatherName, address, city, policeStation, state, 
                pin, phone, mobile, email, guestCount, guestMaleCount, guestFemaleCount, 
                dayCount, bookingAgentId, planId, corporateName, corporateAddress, gstNo} =  req.body
            
            const data = await Guest.findOne({hotelId, isEnable: true, _id})
            if (!data) return res.status(404).send()

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
                 gstNo})
            if (!resUpdate) return res.status(400).send(resUpdate)

            return res.status(200).send(resUpdate)
        }
    } catch(e) {
        return res.status(500).send(e)
    }

    return res.status(404).send()
};

//handel checkout guest
//query string : hotel Id / _Id 
const handelCheckout = async (req, res) => {
    const {hotelId, _id} = req.params

    try {
        // check if total expense & total payment is same
        const data = await Guest.findOne({hotelId, isEnable: true, isActive: true, _id})
        if (!data) return res.status(404).send()

        const resUpdate = await Guest.findByIdAndUpdate(_id, 
            {isActive: false, 
                updatedDate: Date.now});

        if (!resUpdate) return res.status(400).send(resUpdate)

        return res.status(200).send()
    } catch(e) {
        return res.status(500).send(e)
    }
};

//handel delete guest
//query string : hotel Id / _Id
const handelRemove = async (req, res) => {
    const {hotelId, _id} = req.params
    
    try {
        const data = await Guest.findOne({hotelId, isEnable: true, _id});
        if (!data) return res.status(404).send()

        const resDelete = await Guest.findByIdAndUpdate(_id, {isEnable: false});
        if (!resDelete) return res.status(400).send(resDelete)

        return res.status(200).send(resDelete)
    } catch(e) {
        return res.status(500).send(e)
    }
};

module.exports = {
    handelSearch,
    handelDetail,
    handelCreate,
    handelUpdate,
    handelRemove,
    handelCheckout
};