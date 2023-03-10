const Guest = require("../models/guests");
const Room = require("../models/rooms");
const GuestRoom = require("../models/guestRooms");
const GuestExpensePayment = require("../models/guestExpensesPayments");

//handel search guest
//query string : hotel Id?search= guest name, father name, mobile, address, city, police station, state, pin 
const handelSearch = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const search = req.query.search;
        let newList = [];

        if (!search) {
            const data = await Guest.find({hotelId, isEnable: true })
                                    .sort('name')                                
                                    .select('_id idDocumentId idNo name age fatherName address city policeStation state pin phone mobile email guestCount guestMaleCount guestFemaleCount bookingAgentId planId corporateName corporateAddress gstNo roomNos checkInDate checkInTime dayCount checkOutDate checkOutTime isCheckedOut')
                                    .exec();

            if (!data) return res.status(404).send();
            
            await Promise.all(data.map(async (element) => {
                const object = {
                    "_id": element._id,
                    "idDocumentId": element.idDocumentId,
                    "idNo": element.idNo,
                    "name": element.name,
                    "age": element.age,
                    "fatherName": element.fatherName,
                    "address": element.address,
                    "city": element.city,
                    "policeStation": element.policeStation,
                    "state": element.state,
                    "pin": element.pin,
                    "phone": element.phone,
                    "mobile": element.mobile,
                    "email": element.email,
                    "guestCount": element.guestCount,
                    "guestMaleCount": element.guestMaleCount,
                    "guestFemaleCount": element.guestFemaleCount,
                    "bookingAgentId": element.bookingAgentId,
                    "planId": element.planId,
                    "corporateName": element.corporateName,
                    "corporateAddress": element.corporateAddress,
                    "gstNo": element.gstNo,
                    "roomNos": element.roomNos,                        
                    "totalExpenseAmount": await totalExpense(hotelId, element._id),
                    "totalPaidAmount": await totalPayment(hotelId, element._id),
                    "checkInDate": element.checkInDate,
                    "checkInTime": element.checkInTime,
                    "dayCount": element.dayCount,
                    "checkOutDate": element.checkOutDate,
                    "checkOutTime": element.checkOutTime,
                    "isCheckedOut": element.isCheckedOut
                };
                
                newList.push(object);
            }));

            return res.status(200).send(newList);
        }

        if (search) {
            const filterData = await Guest.find({isEnable: true, 
                                                 $or: [{name: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {fatherName: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {address: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {city: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {policeStation: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {state: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                 {pin: {$regex: ".*" + search.trim() + ".*"}},
                                                 {mobile: {$regex: ".*" + search.trim() + ".*"}},
                                                 {roomNos: {$regex: ".*" + search.trim() + ".*"}}]})
                                                .sort("name")                                
                                                .select("_id idDocumentId idNo name age fatherName address city policeStation state pin phone mobile email guestCount guestMaleCount guestFemaleCount bookingAgentId planId corporateName corporateAddress gstNo roomNos checkInDate checkInTime dayCount checkOutDate checkOutTime isCheckedOut").exec();

            if (!filterData) return res.status(404).send();

            await Promise.all(filterData.map(async (element) => {
                const object = {
                    "_id": element._id,
                    "idDocumentId": element.idDocumentId,
                    "idNo": element.idNo,
                    "name": element.name,
                    "age": element.age,
                    "fatherName": element.fatherName,
                    "address": element.address,
                    "city": element.city,
                    "policeStation": element.policeStation,
                    "state": element.state,
                    "pin": element.pin,
                    "phone": element.phone,
                    "mobile": element.mobile,
                    "email": element.email,
                    "guestCount": element.guestCount,
                    "guestMaleCount": element.guestMaleCount,
                    "guestFemaleCount": element.guestFemaleCount,
                    "bookingAgentId": element.bookingAgentId,
                    "planId": element.planId,
                    "corporateName": element.corporateName,
                    "corporateAddress": element.corporateAddress,
                    "gstNo": element.gstNo,
                    "roomNos": element.roomNos,                        
                    "totalExpenseAmount": await totalExpense(hotelId, element._id),
                    "totalPaidAmount": await totalPayment(hotelId, element._id),
                    "checkInDate": element.checkInDate,
                    "checkInTime": element.checkInTime,
                    "dayCount": element.dayCount,
                    "checkOutDate": element.checkOutDate,
                    "checkOutTime": element.checkOutTime,
                    "isCheckedOut": element.isCheckedOut
                };

                newList.push(object);
            }));
            
            return res.status(200).send(newList);
        }
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel detail guest
//query string : hotel Id / _Id
const handelDetail = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const dataGuest = await Guest.findOne({hotelId, _id, isEnable: true}).exec();
        if (!dataGuest) return res.status(404).send();

        const dataGuestRoom = await GuestRoom.find({hotelId, guestId: _id, isEnable: true}).exec();
        if (!dataGuestRoom) return res.status(404).send();

        let data = {
                    "idDocumentId" : dataGuest.idDocumentId, 
                    "idNo" : dataGuest.idNo, 
                    "name" : dataGuest.name, 
                    "age" : dataGuest.age, 
                    "fatherName" : dataGuest.fatherName, 
                    "address" : dataGuest.address, 
                    "city" : dataGuest.city, 
                    "policeStation" : dataGuest.policeStation, 
                    "state" : dataGuest.state,
                    "pin" : dataGuest.pin, 
                    "phone" : dataGuest.phone, 
                    "mobile" : dataGuest.mobile, 
                    "email" : dataGuest.email, 
                    "guestCount" : dataGuest.guestCount, 
                    "guestMaleCount" : dataGuest.guestMaleCount, 
                    "guestFemaleCount" : dataGuest.guestFemaleCount,
                    "dayCount" : dataGuest.dayCount, 
                    "bookingAgentId" : dataGuest.bookingAgentId, 
                    "planId" : dataGuest.planId, 
                    "corporateName" : dataGuest.corporateName, 
                    "corporateAddress" : dataGuest.corporateAddress, 
                    "gstNo" : dataGuest.gstNo,
                    "roomNos" : dataGuest.roomNos,
                    "totalExpenseAmount" : await totalExpense(hotelId, _id),
                    "totalPaidAmount" : await totalPayment(hotelId, _id),
                    "checkInDate" : dataGuest.checkInDate, 
                    "checkInTime" : dataGuest.checkInTime, 
                    "checkOutDate" : dataGuest.checkOutDate,
                    "isCheckedOut" : dataGuest.isCheckedOut,
                    "roomDetails": dataGuestRoom
                };

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
//        "checkInDate" : "", "checkInTime" : "", "roomDetails": []}
const handelCreate = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const {idDocumentId, idNo, name, age, fatherName, address, city, policeStation, state, 
               pin, phone, mobile, email, guestCount, guestMaleCount, guestFemaleCount, dayCount, 
               bookingAgentId, planId, corporateName, corporateAddress, gstNo, 
               checkInDate, checkInTime, roomDetails} = req.body;
            
        let roomNos = "";
        let checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + Number(dayCount));
        let totalExpenseAmount = 0;

        roomDetails.forEach(async element => {
            // consat room no in a string
            roomNos === "" ? roomNos = element.roomNo : roomNos = roomNos +  ", " + element.roomNo;

            // calculate total expense    
            totalExpenseAmount = totalExpenseAmount + element.tariff;
        })          

        // add guest
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
                                roomNos,
                                checkInDate,
                                checkInTime,
                                checkOutDate});

        const resAddGuest = await data.save();
        if (!resAddGuest) return res.status(400).send();
        
        // get new guest id
        const guestId = data._id;
        
        // add guest expense 
        const dataExpense = new GuestExpensePayment({hotelId,
                                                    guestId,
                                                    expenseAmount: totalExpenseAmount,
                                                    transactionDate: new Date(),
                                                    narration: `Expense for room booking (room no. ${roomNos}) on ${checkInDate}`});

        const resAddGuestExpense = await dataExpense.save();
        if (!resAddGuestExpense) return res.status(400).send();

        for(let d = 0; d < dayCount; d++){    
            const bookingDate = new Date(checkInDate);
            bookingDate.setDate(bookingDate.getDate() + d);

            roomDetails.forEach(async room => {
                // add guest room
                const data = new GuestRoom({hotelId,
                                            guestId,
                                            roomId: room.roomId,
                                            roomNo: room.roomNo,
                                            tariff: room.tariff, 
                                            extraBedCount: room.extraBedCount,
                                            extraBedTariff: room.extraBedTariff,
                                            extraPersonCount: room.extraPersonCount,
                                            extraPersonTariff: room.extraPersonTariff,
                                            discount: room.discount,
                                            maxDiscount: room.maxDiscount,
                                            gstPercentage: room.gstPercentage,
                                            gstAmount: room.gstAmount,
                                            price: room.price,
                                            occupancyDate: bookingDate
                                        });

                const resAddGuestRoom = await data.save();
                if (!resAddGuestRoom) return res.status(400).send();

                // update room occupancy status                         
                const resUpdateRoom = await Room.findByIdAndUpdate(room.roomId, 
                                                                {isOccupied: true}).exec();
                
                if (!resUpdateRoom) return res.status(400).send(resUpdateRoom);
            });
        }

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
}


// //handel update guest
// //query string : hotel Id / _Id
// //body : {"idDocumentId" : "", "idNo" : "", "name" : "", "age" : 0, "fatherName" : "", "address" : "", "city" : "", "policeStation" : "", "state" : "",
// //        "pin" : "", "phone" : "", "mobile" : "", "email" : "", "guestCount" : 0, "guestMaleCount" : 0, "guestMaleCount" : 0, "guestFemaleCount" : 0,
// //        "dayCount" : 0, "bookingAgentId" : "", "planId" : "", "corporateName" : "", "corporateAddress" : "", "gstNo" : ""}
// const handelUpdate = async (req, res) => {
//     try {
//         const {hotelId, _id} = req.params;
//         const {idDocumentId, idNo, name, age, fatherName, address, city, policeStation, state, 
//                pin, phone, mobile, email, guestCount, guestMaleCount, guestFemaleCount, 
//                dayCount, bookingAgentId, planId, corporateName, corporateAddress, gstNo} =  req.body;
//         const data = await Guest.findOne({hotelId, isEnable: true, _id}).exec();
//         if (!data) return res.status(404).send();

//         const resUpdate = await Guest.findByIdAndUpdate(_id, 
//                                                             {idDocumentId,
//                                                              idNo: idNo.trim().toUpperCase(), 
//                                                              name: name.trim().toUpperCase(), 
//                                                              age,
//                                                              fatherName: fatherName.trim().toUpperCase(),
//                                                              address: address.trim().toUpperCase(),
//                                                              city: city.trim().toUpperCase(),
//                                                              policeStation: policeStation.trim().toUpperCase(),
//                                                              state: state.trim().toUpperCase(),
//                                                              pin: pin.trim(),
//                                                              phone,
//                                                              mobile,
//                                                              email,
//                                                              guestCount,
//                                                              guestMaleCount,
//                                                              guestFemaleCount,
//                                                              dayCount, 
//                                                              bookingAgentId, 
//                                                              planId, 
//                                                              corporateName, 
//                                                              corporateAddress, 
//                                                              gstNo}).exec();
//         if (!resUpdate) return res.status(400).send(resUpdate);

//         return res.status(200).send(resUpdate);
//     } catch(e) {
//         return res.status(500).send(e);
//     }
// }


//handel delete guest
//query string : hotel Id / _Id
const handelRemove = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;

        // find guest
        const dataGuest = await Guest.findOne({hotelId, isEnable: true, _id}).exec();
        if (!dataGuest) return res.status(404).send();

        // disable guest
        const resGuestDelete = await Guest.findByIdAndUpdate(_id, {isEnable: false}).exec();
        if (!resGuestDelete) return res.status(400).send(resGuestDelete);

        // find guest room
        const dataGuestRoom = await GuestRoom.find({hotelId, isEnable: true, guestId: _id}).exec();
        if (!dataGuestRoom) return res.status(404).send();

        // disable all guest rooms
        dataGuestRoom.forEach(async element => {
            // find guest room
            const resGuestRoomDelete = await GuestRoom.findByIdAndUpdate(element._id, {isEnable: false}).exec();
            if (!resGuestRoomDelete) return res.status(400).send(resGuestRoomDelete);

            // disable room
            const resRoomDelete = await Room.findByIdAndUpdate(element.roomId, {isOccupied: false}).exec();
            if (!resRoomDelete) return res.status(400).send(resRoomDelete);
        });

        // find guest expense & payment
        const dataGuestExpensePayment = await GuestExpensePayment.find({hotelId, isEnable: true, guestId: _id}).exec();
        if (!dataGuestExpensePayment) return res.status(404).send();

        // disable all guest expense & payment
        dataGuestExpensePayment.forEach(async element => {
            // find guest expense & payment
            const resGuestExpensePaymentDelete = await GuestExpensePayment.findByIdAndUpdate(element._id, {isEnable: false}).exec();
            if (!resGuestExpensePaymentDelete) return res.status(400).send(resGuestExpensePaymentDelete);
        });

        return res.status(200).send(resGuestDelete);
    } catch(e) {
        return res.status(500).send(e);
    }
}


async function totalExpense(hotelId, guestId) {
    try {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                let total = 0;
                const data = await GuestExpensePayment.find({hotelId, guestId, isEnable: true})
                                        .select('expenseAmount')
                                        .exec();

                data.forEach(element => {
                    total +=  element.expenseAmount;
                });

                resolve(total);
            },1);
        });
    } catch(e) {
        return 0;
    }        
}

async function totalPayment(hotelId, guestId) {
    try {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                let total = 0;
                const data = await GuestExpensePayment.find({hotelId, guestId, isEnable: true})
                                        .select('paymentAmount')
                                        .exec();

                data.forEach(element => {
                    total +=  element.paymentAmount;
                });

                resolve(total);
            },1);
        });
    } catch(e) {
        return 0;
    }        
}


module.exports = {
    handelSearch,
    handelDetail,
    handelCreate,
    // handelUpdate,
    handelRemove
}