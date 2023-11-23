const mongoose = require("mongoose");
const Guest = require("../models/guests");
const Table = require("../models/tables");

class tableType {
    constructor(id, no) {
      this.id = id;
      this.no = no;
    }
};
class foodTransactionType {
    constructor(tables, foods) {    
        this.tables = tables;
        this.foods = foods;
        this.isCheckedout = false;
    }
};
class paymentTransactionType {
    constructor(amount, narration) {
        this.type = "P",
        this.paymentAmount = amount,
        this.narration = narration,
        this.paymentStatus = true
    }
};

//handel search guest
//query string : hotel Id?search= guest name, father name, mobile, address, city, police station, state, pin 
const handelSearch = async (req, res) => {
    const hotelId = req.params.hotelId;
    const search = req.query.search;

    let pipeline = [];

    try {
        const filter1 = {
            $match: {
                hotelId,
                isEnable: true
            }
        };
        const filter2 = {
            $match: {
                $or: [{name: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                {mobile: {$regex: ".*" + search.trim() + ".*"}},
                {corporateName: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                {corporateAddress: {$regex: ".*" + search.trim().toUpperCase() + ".*"}}]
            }
        };
        const filter3 = {
            $sort: {
                name: 1, corporateName: 1
            }
        };
    
        if (search) {
            pipeline = [filter1, filter2, filter3];
        } else {
            pipeline = [filter1, filter3];
        }

        const data = await Guest.aggregate(pipeline);
        if (!data) return res.status(404).send();
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};

//handel detail guest
//query string : hotel Id / guest Id
const handelDetail = async (req, res) => {
    const {hotelId, guestId} = req.params;

    try {
        const data = await Guest.findOne({hotelId, _id: guestId, isEnable: true});
        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};

//handel add guest
//query string : hotel Id
//body detail: {option [D = detail / S = small],
//        "idDocumentId" : "", "idNo" : "", "name" : "", "age" : 0, "fatherName" : "", "address" : "", "city" : "", "policeStation" : "", "state" : "",
//        "pin" : "", "mobile" : "", "email" : "", "guestCount" : 0, "guestMaleCount" : 0, "guestFemaleCount" : 0,
//        "dayCount" : 0, "bookingAgentId" : "", "planId" : "", "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
//body small: {"name" : "", "mobile" : "", "guestCount" : 0, "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
const handelCreate = async (req, res) => {
    const {hotelId} = req.params;
    const {option} = req.body;

    try {
        if (option.trim().toUpperCase() === "R") {  //For room
            const {idDocumentId, idNo, name, age, fatherName, address, city, 
                policeStation, state, pin, mobile, email, guestCount, 
                guestMaleCount, guestFemaleCount, dayCount, bookingAgentId, 
                planId, corporateName, corporateAddress, gstNo} = req.body;

                const data = new Guest({hotelId,
                    idDocumentId,
                    idNo: idNo ? idNo.trim().toUpperCase() : "", 
                    name: name ? name.trim().toUpperCase() : "", 
                    age,
                    fatherName: fatherName ? fatherName.trim().toUpperCase() : "",
                    address: address ? address.trim().toUpperCase() : "",
                    city: city ? city.trim().toUpperCase() : "",
                    policeStation: policeStation ? policeStation.trim().toUpperCase() : "",
                    state: state ? state.trim().toUpperCase() : "",
                    pin: pin ? pin.trim() : "",
                    mobile,
                    email: email ? email.trim().toLowerCase() : "",
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
                            
        } else if (option.trim().toUpperCase() === "T") {   //for table
            const {name, mobile, guestCount, 
                corporateName, corporateAddress, gstNo, 
                tables} = req.body;

            const data = new Guest({
                hotelId,
                name: name ? name.trim().toUpperCase() : "", 
                mobile,
                guestCount,
                corporateName: corporateName ? corporateName.trim().toUpperCase() : "",
                corporateAddress: corporateAddress ? corporateAddress.trim().toUpperCase() : "", 
                gstNo,
                option});
                
            const resAdd = await data.save();
            // if (!resAdd) return res.status(400).send();

            return res.status(200).send(data)

        } else if (option.trim().toUpperCase() === "S") {   //For service
            const {name, mobile, guestCount, corporateName, corporateAddress, gstNo} = req.body;

            const data = new Guest({
                hotelId,
                name: name ? name.trim().toUpperCase() : "", 
                mobile,
                guestCount,
                corporateName: corporateName ? corporateName.trim().toUpperCase() : "",
                corporateAddress: corporateAddress ? corporateAddress.trim().toUpperCase() : "", 
                gstNo,
                option});

            const resAdd = await data.save();
            if (!resAdd) return res.status(400).send();
    
            return res.status(200).send(data);

        } else if (option.trim().toUpperCase() === "M") {   //For miscellaneous
            const {name, mobile, guestCount, corporateName, corporateAddress, gstNo} = req.body;

            const data = new Guest({
                hotelId,
                name: name ? name.trim().toUpperCase() : "", 
                mobile,
                guestCount,
                corporateName: corporateName ? corporateName.trim().toUpperCase() : "",
                corporateAddress: corporateAddress ? corporateAddress.trim().toUpperCase() : "", 
                gstNo,
                option
            });

            const resAdd = await data.save();
            if (!resAdd) return res.status(400).send();
    
            return res.status(200).send(data);

        } else if (option.trim().toUpperCase() === "A") {   //For advance
            const {name, mobile, guestCount, corporateName, corporateAddress, gstNo} = req.body;

            const data = new Guest({
                hotelId,
                name: name ? name.trim().toUpperCase() : "", 
                mobile,
                guestCount,
                corporateName: corporateName ? corporateName.trim().toUpperCase() : "",
                corporateAddress: corporateAddress ? corporateAddress.trim().toUpperCase() : "", 
                gstNo,
                option});

            const resAdd = await data.save();
            if (!resAdd) return res.status(400).send();
    
            return res.status(200).send(data);
        }
    } catch(e) {
        return res.status(500).send(e);
    }
};

//handel update guest
//query string : hotel Id / guest Id
//body detail: {option [D = detail / S = small],
//        "idDocumentId" : "", "idNo" : "", "name" : "", "age" : 0, "fatherName" : "", "address" : "", "city" : "", "policeStation" : "", "state" : "",
//        "pin" : "", "mobile" : "", "email" : "", "guestCount" : 0, "guestMaleCount" : 0, "guestMaleCount" : 0, "guestFemaleCount" : 0,
//        "dayCount" : 0, "bookingAgentId" : "", "planId" : "", "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
//body detail: {"name" : "", "mobile" : "", "guestCount" : 0, "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
const handelUpdate = async (req, res) => {
    const {hotelId, guestId} = req.params;
    const {option} = req.body;

    try {
        if ((option.trim().toUpperCase() === "M") || 
            (option.trim().toUpperCase() === "S") ||
            (option.trim().toUpperCase() === "T") ||
            (option.trim().toUpperCase() === "A")) {
            const {name, mobile, guestCount, corporateName, corporateAddress, gstNo} =  req.body;
            const data = await Guest.findOne({hotelId, _id: guestId, isEnable: true});
            if (!data) return res.status(404).send();

            const resUpdate = await Guest.findByIdAndUpdate(guestId, 
                {
                    name: name ? name.trim().toUpperCase() : "", 
                    mobile,
                    guestCount,
                    corporateName: corporateName ? corporateName.trim().toUpperCase() : "",
                    corporateAddress: corporateAddress ? corporateAddress.trim().toUpperCase() : "", 
                    gstNo
                });

            if (!resUpdate) return res.status(400).send(resUpdate);
            return res.status(200).send(resUpdate);

        } else if (option.trim().toUpperCase() === "R") {
            const {idDocumentId, idNo, name, age, fatherName, address, city, policeStation, state, 
                pin, mobile, email, guestCount, guestMaleCount, guestFemaleCount, 
                dayCount, bookingAgentId, planId, corporateName, corporateAddress, gstNo} =  req.body;
            
            const data = await Guest.findOne({hotelId, _id: guestId, isEnable: true});
            if (!data) return res.status(404).send();

            const resUpdate = await Guest.findByIdAndUpdate(guestId, 
                {
                    idDocumentId,
                    idNo: idNo ? idNo.trim().toUpperCase() : "", 
                    name: name ? name.trim().toUpperCase() : "", 
                    age,
                    fatherName: fatherName ? fatherName.trim().toUpperCase() : "",
                    address: address ? address.trim().toUpperCase() : "",
                    city: city ? city.trim().toUpperCase() : "",
                    policeStation: policeStation ? policeStation.trim().toUpperCase() : "",
                    state: state ? state.trim().toUpperCase() : "",
                    pin: pin ? pin.trim() : "",
                    mobile,
                    email: email ? email.trim().toLowerCase() : "",
                    guestCount,
                    guestMaleCount,
                    guestFemaleCount,
                    dayCount, 
                    bookingAgentId, 
                    planId, 
                    corporateName, 
                    corporateAddress, 
                    gstNo
                });
            if (!resUpdate) return res.status(400).send(resUpdate);

            return res.status(200).send(resUpdate);
        }
    } catch(e) {
        return res.status(500).send(e);
    }
};

// //handel checkout guest
// //query string : hotel Id / guest Id / flag
// const handelCheckout = async (req, res) => {
//     const {hotelId, guestId, flag} = req.params;

//     try {
//         // check if total expense & total payment is same
//         const data = await Guest.findOne({hotelId, isEnable: true, isActive: true, guestId});
//         if (!data) return res.status(404).send();

//         const resUpdate = await Guest.findByIdAndUpdate(guestId, 
//             {isActive: false, 
//                 updatedDate: Date.now});
//         if (!resUpdate) return res.status(400).send(resUpdate);

//         return res.status(200).send();
//     } catch(e) {
//         return res.status(500).send(e);
//     }
// };

//handel checkout & delete guest
//query string : hotel Id / guestId / flag
const handelRemove = async (req, res) => {
    const {hotelId, guestId, flag} = req.params;

    // for checkout
    if (flag == "C") {
        try {
            // check if total expense & total payment is same
            const data = await Guest.findOne({hotelId, _id: guestId, isEnable: true, isActive: true});
            if (!data) return res.status(404).send();

            const resUpdate = await Guest.findByIdAndUpdate(guestId, 
                {isActive: false, updatedDate: Date.now});
            if (!resUpdate) return res.status(400).send(resUpdate);

            return res.status(200).send();
        } catch(e) {
            return res.status(500).send(e);
        }

        return;
    }

    // for delete
    if (flag == "D") {
        try {
            const data = await Guest.findOne({hotelId, _id: guestId, isEnable: true});
            if (!data) return res.status(404).send();

            if (data.option == "T") {
                //get last transaction id
                //get all tables id of that transaction
                const filter1 = {
                    $match: {
                        _id: mongoose.Types.ObjectId(guestId),         
                        hotelId,
                        isEnable: true
                    }
                };
                const filter2 = {
                    $project: {
                        _id: 0,
                        tablesDetail: {
                            $slice: ["$tablesDetail", -1] 
                        }
                    }
                };

                const pipeline = [filter1, filter2];
                const foundTableDetails = await Guest.aggregate(pipeline);  

                //update all tables guestid it null & occupied status is false
                foundTableDetails.forEach(async (item) => {
                    item.tablesDetail.forEach(async (tableDetail) => {
                        tableDetail.tables.forEach(async (table) => {
                            const tableId = table.id;
                            const resRelese = await Table.findByIdAndUpdate(
                                                    mongoose.Types.ObjectId(tableId), 
                                                    {$set: {isOccupied: false,
                                                            guestId: ""}}                                        
                                                    );  
                            if (!resRelese) return res.status(404).send();                                            
                        });
                    });
                });
            }

            const resDelete = await Guest.findByIdAndUpdate(guestId, {isEnable: false});
            if (!resDelete) return res.status(400).send(resDelete);

            return res.status(200).send(resDelete);
        } catch(e) {
            return res.status(500).send(e);
        }

        return;
    }
};

module.exports = {
    handelSearch,
    handelDetail,
    handelCreate,
    handelUpdate,
    handelRemove
};