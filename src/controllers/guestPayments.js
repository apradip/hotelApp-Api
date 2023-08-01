const mongoose = require("mongoose");
const Guest = require("../models/guests");
const GuestExpensePayment = require("../models/guestExpensesPaymentsTransaction");

class paymentTransactionType {
    constructor(amount, narration) {
        this.type = "P",
        this.paymentAmount = amount,
        this.narration = narration,
        this.paymentStatus = true
    }
};


// //handel detail guest
// //query string : hotel Id / guest Id
// const handelDetail = async (req, res) => {
//     const {hotelId, guestId} = req.params;

//     try {
//         const data = await Guest.findOne({hotelId, _id: guestId, isEnable: true});
//         if (!data) return res.status(404).send();

//         return res.status(200).send(data);
//     } catch(e) {
//         return res.status(500).send(e);
//     }
// };

// //handel add guest
// //query string : hotel Id
// //body detail: {option [D = detail / S = small],
// //        "idDocumentId" : "", "idNo" : "", "name" : "", "age" : 0, "fatherName" : "", "address" : "", "city" : "", "policeStation" : "", "state" : "",
// //        "pin" : "", "mobile" : "", "email" : "", "guestCount" : 0, "guestMaleCount" : 0, "guestFemaleCount" : 0,
// //        "dayCount" : 0, "bookingAgentId" : "", "planId" : "", "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
// //body small: {"name" : "", "mobile" : "", "guestCount" : 0, "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
// const handelCreate = async (req, res) => {
//     const {hotelId} = req.params;
//     const {option} = req.body;

//     try {
//         if (option.trim().toUpperCase() === "R") {  //For room
//             const {idDocumentId, idNo, name, age, fatherName, address, city, 
//                 policeStation, state, pin, mobile, email, guestCount, 
//                 guestMaleCount, guestFemaleCount, dayCount, bookingAgentId, 
//                 planId, corporateName, corporateAddress, gstNo} = req.body;

//                 const data = new Guest({hotelId,
//                     idDocumentId,
//                     idNo: idNo ? idNo.trim().toUpperCase() : "", 
//                     name: name ? name.trim().toUpperCase() : "", 
//                     age,
//                     fatherName: fatherName ? fatherName.trim().toUpperCase() : "",
//                     address: address ? address.trim().toUpperCase() : "",
//                     city: city ? city.trim().toUpperCase() : "",
//                     policeStation: policeStation ? policeStation.trim().toUpperCase() : "",
//                     state: state ? state.trim().toUpperCase() : "",
//                     pin: pin ? pin.trim() : "",
//                     mobile,
//                     email: email ? email.trim().toLowerCase() : "",
//                     guestCount,
//                     guestMaleCount,
//                     guestFemaleCount,
//                     dayCount, 
//                     bookingAgentId, 
//                     planId, 
//                     corporateName, 
//                     corporateAddress, 
//                     gstNo,
//                     option});

//             const resAdd = await data.save();
//             if (!resAdd) return res.status(400).send();
    
//             return res.status(200).send(data);
                            
//         } else if (option.trim().toUpperCase() === "T") {   //for table
//             const {name, mobile, guestCount, 
//                 corporateName, corporateAddress, gstNo, 
//                 tables} = req.body;

//             const data = new Guest({
//                 hotelId,
//                 name: name ? name.trim().toUpperCase() : "", 
//                 mobile,
//                 guestCount,
//                 corporateName: corporateName ? corporateName.trim().toUpperCase() : "",
//                 corporateAddress: corporateAddress ? corporateAddress.trim().toUpperCase() : "", 
//                 gstNo,
//                 option});
                
//             const resAdd = await data.save();
//             // if (!resAdd) return res.status(400).send();

//             // const guestId = data._id;    
//             // const transaction = new foodTransactionType([], []);

//             // // for(const table of tables) {
//             // await Promise.all(tables.map(async (table) => {
//             //     // check if the table is empty
//             //     const filter = {
//             //         hotelId, 
//             //         _id: mongoose.Types.ObjectId(table.id), 
//             //         isOccupied: false, 
//             //         isEnable: true
//             //     };
//             //     const foundTable = await Table.findOne(filter);
    
//             //     if (foundTable) {
//             //         transaction.tables.push(new tableType(
//             //             table.id, 
//             //             foundTable.no
//             //         ));
//             //     }
    
//             //     const update = {
//             //         guestId: guestId, 
//             //         isOccupied: true
//             //     };
//             //     const resTableUpdate = await Table.updateOne(filter, update);
//             //     if (!resTableUpdate) return res.status(404).send();
//             // }));
    
//             // const filterGuest = {_id: guestId};
//             // const updateGuest = {$push: {tablesDetail: transaction}};
//             // const resGuestUpdate = await Guest.updateOne(filterGuest, updateGuest);  
//             // if (!resGuestUpdate) return res.status(404).send();

//             return res.status(200).send(data)

//         } else if (option.trim().toUpperCase() === "S") {   //For service
//             const {name, mobile, guestCount, corporateName, corporateAddress, gstNo} = req.body;

//             const data = new Guest({
//                 hotelId,
//                 name: name ? name.trim().toUpperCase() : "", 
//                 mobile,
//                 guestCount,
//                 corporateName: corporateName ? corporateName.trim().toUpperCase() : "",
//                 corporateAddress: corporateAddress ? corporateAddress.trim().toUpperCase() : "", 
//                 gstNo,
//                 option});

//             const resAdd = await data.save();
//             if (!resAdd) return res.status(400).send();
    
//             return res.status(200).send(data);

//         } else if (option.trim().toUpperCase() === "M") {   //For miscellaneous
//             const {name, mobile, guestCount, corporateName, corporateAddress, gstNo} = req.body;

//             const data = new Guest({
//                 hotelId,
//                 name: name ? name.trim().toUpperCase() : "", 
//                 mobile,
//                 guestCount,
//                 corporateName: corporateName ? corporateName.trim().toUpperCase() : "",
//                 corporateAddress: corporateAddress ? corporateAddress.trim().toUpperCase() : "", 
//                 gstNo,
//                 option
//             });

//             const resAdd = await data.save();
//             if (!resAdd) return res.status(400).send();
    
//             return res.status(200).send(data);

//         } else if (option.trim().toUpperCase() === "A") {   //For advance
//             const {name, mobile, guestCount, corporateName, corporateAddress, gstNo} = req.body;

//             const data = new Guest({
//                 hotelId,
//                 name: name ? name.trim().toUpperCase() : "", 
//                 mobile,
//                 guestCount,
//                 corporateName: corporateName ? corporateName.trim().toUpperCase() : "",
//                 corporateAddress: corporateAddress ? corporateAddress.trim().toUpperCase() : "", 
//                 gstNo,
//                 option});

//             const resAdd = await data.save();
//             if (!resAdd) return res.status(400).send();
    
//             return res.status(200).send(data);
//         }
//     } catch(e) {
//         return res.status(500).send(e);
//     }
// };

// //handel update guest
// //query string : hotel Id / guest Id
// //body detail: {option [D = detail / S = small],
// //        "idDocumentId" : "", "idNo" : "", "name" : "", "age" : 0, "fatherName" : "", "address" : "", "city" : "", "policeStation" : "", "state" : "",
// //        "pin" : "", "phone" : "", "mobile" : "", "email" : "", "guestCount" : 0, "guestMaleCount" : 0, "guestMaleCount" : 0, "guestFemaleCount" : 0,
// //        "dayCount" : 0, "bookingAgentId" : "", "planId" : "", "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
// //body detail: {"name" : "", "mobile" : "", "guestCount" : 0, "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
// const handelUpdate = async (req, res) => {
//     const {hotelId, guestId} = req.params;
//     const {option} = req.body;

//     try {
//         if ((option.trim().toUpperCase() === "M") || 
//             (option.trim().toUpperCase() === "S") ||
//             (option.trim().toUpperCase() === "T") ||
//             (option.trim().toUpperCase() === "A")) {
//             const {name, mobile, guestCount, corporateName, corporateAddress, gstNo} =  req.body;
//             const data = await Guest.findOne({hotelId, isEnable: true, guestId});
//             if (!data) return res.status(404).send();

//             const resUpdate = await Guest.findByIdAndUpdate(guestId, 
//                 {
//                     name: name ? name.trim().toUpperCase() : "", 
//                     mobile,
//                     guestCount,
//                     corporateName: corporateName ? corporateName.trim().toUpperCase() : "",
//                     corporateAddress: corporateAddress ? corporateAddress.trim().toUpperCase() : "", 
//                     gstNo
//                 });

//             if (!resUpdate) return res.status(400).send(resUpdate);
//             return res.status(200).send(resUpdate);

//         } else if (option.trim().toUpperCase() === "R") {
//             const {idDocumentId, idNo, name, age, fatherName, address, city, policeStation, state, 
//                 pin, phone, mobile, email, guestCount, guestMaleCount, guestFemaleCount, 
//                 dayCount, bookingAgentId, planId, corporateName, corporateAddress, gstNo} =  req.body;
            
//             const data = await Guest.findOne({hotelId, isEnable: true, guestId});
//             if (!data) return res.status(404).send();

//             const resUpdate = await Guest.findByIdAndUpdate(guestId, 
//                 {
//                     idDocumentId,
//                     idNo: idNo.trim().toUpperCase(), 
//                     name: name.trim().toUpperCase(), 
//                     age,
//                     fatherName: fatherName.trim().toUpperCase(),
//                     address: address.trim().toUpperCase(),
//                     city: city.trim().toUpperCase(),
//                     policeStation: policeStation.trim().toUpperCase(),
//                     state: state.trim().toUpperCase(),
//                     pin: pin.trim(),
//                     phone,
//                     mobile,
//                     email,
//                     guestCount,
//                     guestMaleCount,
//                     guestFemaleCount,
//                     dayCount, 
//                     bookingAgentId, 
//                     planId, 
//                     corporateName, 
//                     corporateAddress, 
//                     gstNo
//                 });
//             if (!resUpdate) return res.status(400).send(resUpdate);

//             return res.status(200).send(resUpdate);
//         }
//     } catch(e) {
//         return res.status(500).send(e);
//     }
// };

//handel add payment
//query string : hotel Id / guest Id
//body : {"amount" : 0, "narration" : ""}
const handelAdvancePayment = async (req, res) => {
    const {hotelId, guestId} = req.params;
    const {amount, narration} = req.body;

    try {
        //Start :: insert into guest expense payment 
        await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId),
                hotelId,
                isActive: true,
                isEnable: true
            },
            {
                $push: {
                    "expensesPaymentsDetail": new paymentTransactionType(amount, narration)
                }
            }
        );   
        //End :: insert into guest expense payment 

        //Start :: insert into guest payment transaction
        const dataPayment = new GuestExpensePayment({
            hotelId,
            guestId,
            type: "P",
            paymentAmount: amount,
            narration: narration
        });
        await dataPayment.save();
        //End :: insert into guest payment transaction

        //Start :: update balance
        await Guest.findByIdAndUpdate(
            mongoose.Types.ObjectId(guestId), 
            {$inc: {balance: amount}}
        );
        //End :: update balance
    } catch(e) {
        return res.status(500).send(e);
    }   
    
    return res.status(200).send();
};


// //handel delete guest
// //query string : hotel Id / guestId
// const handelRemove = async (req, res) => {
//     const {hotelId, guestId} = req.params;
    
//     try {
//         const data = await Guest.findOne({hotelId, _id: guestId, isEnable: true});
//         if (!data) return res.status(404).send();

//         if (data.option == "T") {
//             //get last transaction id
//             //get all tables id of that transaction
//             const filter1 = {
//                 $match: {
//                     _id: mongoose.Types.ObjectId(guestId),         
//                     hotelId,
//                     isEnable: true
//                 }
//             };
//             const filter2 = {
//                 $project: {
//                     _id: 0,
//                     tablesDetail: {
//                         $slice: ["$tablesDetail", -1] 
//                     }
//                 }
//             };

//             const pipeline = [filter1, filter2];
//             const foundTableDetails = await Guest.aggregate(pipeline);  

//             //update all tables guestid it null & occupied status is false
//             foundTableDetails.forEach(async (item) => {
//                 item.tablesDetail.forEach(async (tableDetail) => {
//                     tableDetail.tables.forEach(async (table) => {
//                         const tableId = table.id;
//                         const resRelese = await Table.findByIdAndUpdate(
//                                                 mongoose.Types.ObjectId(tableId), 
//                                                 {$set: {isOccupied: false,
//                                                         guestId: ""}}                                        
//                                                 );  
//                         if (!resRelese) return res.status(404).send();                                            
//                     });
//                 });
//             });
//         }

//         const resDelete = await Guest.findByIdAndUpdate(guestId, {isEnable: false});
//         if (!resDelete) return res.status(400).send(resDelete);

//         return res.status(200).send(resDelete);
//     } catch(e) {
//         return res.status(500).send(e);
//     }
// };

module.exports = {
    // handelDetail,
    // handelCreate,
    // handelUpdate,
    // handelRemove,
    handelAdvancePayment
};