const mongoose = require("mongoose");
const GST = require("./gsts");
const Guest = require("../models/guests");
const Room = require("../models/rooms");
const GuestRoomTransaction = require("../models/guestRoomsTransaction");
const date = require("date-and-time");

class roomType {
    constructor(id, no, tariff, extraBedCount, extraBedTariff, 
        extraPersonCount, extraPersonTariff, discount, 
        maxDiscount, gstPercentage, occupancyDate) {

        const unitPrice = tariff + 
                          (extraBedCount * extraBedTariff) + 
                          (extraPersonCount * extraPersonTariff) -
                          discount;

        this.id = id;
        this.no = no;
        this.tariff = tariff;
        this.extraBedCount = extraBedCount;
        this.extraBedTariff = extraBedTariff;
        this.extraPersonCount = extraPersonCount;
        this.extraPersonTariff = extraPersonTariff;
        this.discount = discount;
        this.maxDiscount = maxDiscount;
        this.gstPercentage = gstPercentage;
        this.gstCharge = unitPrice * (gstPercentage / 100);
        this.totalPrice = unitPrice + this.gstCharge;
        this.occupancyDate = occupancyDate;
    }
};

class expenseTransactionType {
    constructor(expenseAmount) {
        this.type = "R",
        this.expenseAmount = expenseAmount,
        this.narration = 'Expense for the room items.'
    }
};

//handel search guest
//query string : hotel Id?search= guest name, father name, mobile, address, city, police station, state, pin 
const handelSearch = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const search = req.query.search;
        let newList = [];

        if (!search) {
            const data = await find({hotelId, isEnable: true })
                                    .sort('name')                                
                                    .select('_id idDocumentId idNo name age fatherName address city policeStation state pin phone mobile email guestCount guestMaleCount guestFemaleCount bookingAgentId planId corporateName corporateAddress gstNo roomNos checkInDate checkInTime dayCount checkOutDate checkOutTime isCheckedOut');
            if (!data) return res.status(404).send();
            
            await Promise.all(data.map(async (element) => {
                const object = {
                    _id: element._id,
                    idDocumentId: element.idDocumentId,
                    idNo: element.idNo,
                    name: element.name,
                    age: element.age,
                    fatherName: element.fatherName,
                    address: element.address,
                    city: element.city,
                    policeStation: element.policeStation,
                    state: element.state,
                    pin: element.pin,
                    phone: element.phone,
                    mobile: element.mobile,
                    email: element.email,
                    guestCount: element.guestCount,
                    guestMaleCount: element.guestMaleCount,
                    guestFemaleCount: element.guestFemaleCount,
                    bookingAgentId: element.bookingAgentId,
                    planId: element.planId,
                    corporateName: element.corporateName,
                    corporateAddress: element.corporateAddress,
                    gstNo: element.gstNo,
                    roomNos: element.roomNos,                        
                    // totalExpenseAmount: await totalExpense(hotelId, element._id),
                    // totalPaidAmount: await totalPayment(hotelId, element._id),
                    // checkInDate: element.checkInDate,
                    // checkInTime: element.checkInTime,
                    dayCount: element.dayCount,
                    checkOutDate: element.checkOutDate,
                    checkOutTime: element.checkOutTime,
                    isCheckedOut: element.isCheckedOut
                };
                
                newList.push(object);
            }));

            return res.status(200).send(newList);
        }

        if (search) {
            const filterData = await find({isEnable: true, 
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
                    _id: element._id,
                    idDocumentId: element.idDocumentId,
                    idNo: element.idNo,
                    name: element.name,
                    age: element.age,
                    fatherName: element.fatherName,
                    address: element.address,
                    city: element.city,
                    policeStation: element.policeStation,
                    state: element.state,
                    pin: element.pin,
                    phone: element.phone,
                    mobile: element.mobile,
                    email: element.email,
                    guestCount: element.guestCount,
                    guestMaleCount: element.guestMaleCount,
                    guestFemaleCount: element.guestFemaleCount,
                    bookingAgentId: element.bookingAgentId,
                    planId: element.planId,
                    corporateName: element.corporateName,
                    corporateAddress: element.corporateAddress,
                    gstNo: element.gstNo,
                    roomNos: element.roomNos,                        
                    // totalExpenseAmount: await totalExpense(hotelId, element._id),
                    // totalPaidAmount: await totalPayment(hotelId, element._id),
                    // checkInDate: element.checkInDate,
                    // checkInTime: element.checkInTime,
                    dayCount: element.dayCount,
                    checkOutDate: element.checkOutDate,
                    checkOutTime: element.checkOutTime,
                    isCheckedOut: element.isCheckedOut
                };

                newList.push(object);
            }));
            
            return res.status(200).send(newList);
        }
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel detail guest
//query string : hotel Id / guest Id
const handelDetail = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;
        const dataGuest = await findOne({
            hotelId: hotelId, 
            _id: mongoose.Types.ObjectId(guestId), 
            isEnable: true});
        if (!dataGuest) return res.status(404).send();

        let data = {
                    idDocumentId: dataGuest.idDocumentId, 
                    idNo: dataGuest.idNo, 
                    name: dataGuest.name, 
                    age: dataGuest.age, 
                    fatherName: dataGuest.fatherName, 
                    address: dataGuest.address, 
                    city: dataGuest.city, 
                    policeStation: dataGuest.policeStation, 
                    state: dataGuest.state,
                    pin: dataGuest.pin, 
                    phone: dataGuest.phone, 
                    mobile: dataGuest.mobile, 
                    email: dataGuest.email, 
                    guestCount: dataGuest.guestCount, 
                    guestMaleCount: dataGuest.guestMaleCount, 
                    guestFemaleCount: dataGuest.guestFemaleCount,
                    dayCount: dataGuest.dayCount, 
                    bookingAgentId: dataGuest.bookingAgentId, 
                    planId: dataGuest.planId, 
                    corporateName: dataGuest.corporateName, 
                    corporateAddress: dataGuest.corporateAddress, 
                    gstNo: dataGuest.gstNo,
                    roomNos: dataGuest.roomNos,
                    //totalExpenseAmount: await totalExpense(hotelId, _id),
                    //totalPaidAmount: await totalPayment(hotelId, _id),
                    checkInDate: dataGuest.checkInDate, 
                    checkInTime: dataGuest.checkInTime, 
                    checkOutDate: dataGuest.checkOutDate,
                    isCheckedOut: dataGuest.isCheckedOut,
                    roomDetails: dataGuest.roomDetails
                };

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


// //handel add guest
// //query string : hotel Id
// //body : {"idDocumentId" : "", "idNo" : "", "name" : "", "age" : 0, "fatherName" : "", "address" : "", "city" : "", "policeStation" : "", "state" : "",
// //        "pin" : "", "phone" : "", "mobile" : "", "email" : "", "guestCount" : 0, "guestMaleCount" : 0, "guestFemaleCount" : 0,
// //        "dayCount" : 0, "bookingAgentId" : "", "planId" : "", "corporateName" : "", "corporateAddress" : "", "gstNo" : "",
// //        "checkInDate" : "", "checkInTime" : "", "roomDetails": []}
// const handelCreate = async (req, res) => {
//     try {
//         const hotelId = req.params.hotelId;
//         const {idDocumentId, idNo, name, age, fatherName, address, city, policeStation, state, 
//                pin, phone, mobile, email, guestCount, guestMaleCount, guestFemaleCount, dayCount, 
//                bookingAgentId, planId, corporateName, corporateAddress, gstNo, 
//                checkInDate, checkInTime, roomDetails} = req.body;
        
//         // get hotel tax details    
//         const hotel = await Hotel.detail(hotelId);

//         let roomNos = "";
//         let checkOutDate = new Date(checkInDate);
//         checkOutDate.setDate(checkOutDate.getDate() + Number(dayCount));
//         let totalExpenseAmount = 0;


//         roomDetails.forEach(async element => {
//             // consat room no in a string
//             roomNos === "" ? roomNos = element.roomNo : roomNos = roomNos +  ", " + element.roomNo;

//             // calculate total expense    
//             totalExpenseAmount = totalExpenseAmount + element.tariff;
//         })          

//         // add guest
//         const data = new Guest({hotelId,
//                                 idDocumentId,
//                                 idNo: idNo.trim().toUpperCase(), 
//                                 name: name.trim().toUpperCase(), 
//                                 age,
//                                 fatherName: fatherName.trim().toUpperCase(),
//                                 address: address.trim().toUpperCase(),
//                                 city: city.trim().toUpperCase(),
//                                 policeStation: policeStation.trim().toUpperCase(),
//                                 state: state.trim().toUpperCase(),
//                                 pin: pin.trim(),
//                                 phone,
//                                 mobile,
//                                 email,
//                                 guestCount,
//                                 guestMaleCount,
//                                 guestFemaleCount,
//                                 dayCount, 
//                                 bookingAgentId, 
//                                 planId, 
//                                 corporateName, 
//                                 corporateAddress, 
//                                 gstNo, 
//                                 roomNos,
//                                 checkInDate,
//                                 checkInTime,
//                                 checkOutDate});

//         const resAddGuest = await data.save();
//         if (!resAddGuest) return res.status(400).send();
        
//         // get new guest id
//         const guestId = data._id;
        
//         // // add guest expense 
//         // const dataExpense = new GuestExpensePayment({hotelId,
//         //                                             guestId,
//         //                                             expenseAmount: totalExpenseAmount,
//         //                                             transactionDate: new Date(),
//         //                                             narration: `Expense for room booking (room no. ${roomNos}) on ${checkInDate}`});

//         // const resAddGuestExpense = await dataExpense.save();
//         // if (!resAddGuestExpense) return res.status(400).send();

//         let transaction = [];

//         for(let d = 0; d < dayCount; d++){    
//             const bookingDate = new Date(checkInDate);
//             bookingDate.setDate(bookingDate.getDate() + d);

//             roomDetails.forEach(async room => {

//                 // check for room existance
//                 const foundRoom = await Room.findOne(
//                     {
//                         _id: mongoose.Types.ObjectId(room.id), 
//                         hotelId: hotel._id, 
//                         isEnable: true
//                     }
//                 );    

//                 if (foundRoom) {
//                     transaction.push(new roomType(
//                         room.id, 
//                         foundRoom.no, 
//                         parseInt(foundRoom.tariff).toFixed(hotel.fincialDecimalPlace),
//                         parseInt(room.extraBedCount), 
//                         parseInt(room.extraBedTariff).toFixed(hotel.fincialDecimalPlace),
//                         parseInt(room.extraPersonCount), 
//                         parseInt(room.extraPersonTariff).toFixed(hotel.fincialDecimalPlace),
//                         parseInt(room.discount).toFixed(hotel.fincialDecimalPlace), 
//                         parseInt(room.maxDiscount), 
//                         parseInt(await GST.search(unitPrice)).toFixed(hotel.fincialDecimalPlace),
//                         room.occupancyDate
//                     ));
//                 }
        
//                 // // add guest room
//                 // const data = new GuestRoom({hotelId,
//                 //                             guestId,
//                 //                             roomId: room.roomId,
//                 //                             roomNo: room.roomNo,
//                 //                             tariff: room.tariff, 
//                 //                             extraBedCount: room.extraBedCount,
//                 //                             extraBedTariff: room.extraBedTariff,
//                 //                             extraPersonCount: room.extraPersonCount,
//                 //                             extraPersonTariff: room.extraPersonTariff,
//                 //                             discount: room.discount,
//                 //                             maxDiscount: room.maxDiscount,
//                 //                             gstPercentage: room.gstPercentage,
//                 //                             gstAmount: room.gstAmount,
//                 //                             price: room.price,
//                 //                             occupancyDate: bookingDate
//                 //                         });

//                 // const resAddGuestRoom = await data.save();
//                 // if (!resAddGuestRoom) return res.status(400).send();

//                 // // update room occupancy status                         
//                 // const resUpdateRoom = await Room.findByIdAndUpdate(room.roomId, 
//                 //                                                 {isOccupied: true}).exec();
                
//                 // if (!resUpdateRoom) return res.status(400).send(resUpdateRoom);
//             });
//         }

//         // add guest room
//         const resRoomUpdate = await Guest.updateOne(
//             {
//                 _id: mongoose.Types.ObjectId(guestId), 
//                 hotelId,
//                 isActive: true,
//                 isEnable: true
//             },
//             {
//                 $set: {
//                     roomsDetail: transaction
//                 }
//             }
//         );  
//         if (!resRoomUpdate) return res.status(404).send();

//         // const data = new Guest({hotelId,
//         //                             guestId,
//         //                             roomId: room.roomId,
//         //                             roomNo: room.roomNo,
//         //                             tariff: room.tariff, 
//         //                             extraBedCount: room.extraBedCount,
//         //                             extraBedTariff: room.extraBedTariff,
//         //                             extraPersonCount: room.extraPersonCount,
//         //                             extraPersonTariff: room.extraPersonTariff,
//         //                             discount: room.discount,
//         //                             maxDiscount: room.maxDiscount,
//         //                             gstPercentage: room.gstPercentage,
//         //                             gstAmount: room.gstAmount,
//         //                             price: room.price,
//         //                             occupancyDate: bookingDate
//         //                         });

//                 // const resAddGuestRoom = await data.save();
//                 // if (!resAddGuestRoom) return res.status(400).send();


//         return res.status(200).send(data);
//     } catch(e) {
//         return res.status(500).send(e);
//     }        
// }




// handel room booking
//query string : hotel Id / guest Id
//body : {"rooms": [{"transactionId": "", "id": "", "extraBedCount": 0, "extraPersonCount": 0, "discount": 0, "occupancyDate": "YYYY-MM-DD", "operation": "A"}]}
const handelCreate = async (req, res) => {
    try {
        const { hotelId, guestId } = req.params;
        const { rooms } = req.body;

        let roomsDb = [];
        let prvBalanceDb = 0;
        let prvRoomBalance = 0;
        let roomBalance = 0;
        let balanceDb = 0;

        // find all booked rooms
        const filter1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId: hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filter2 = {
            $project: {
                _id: 0, hotelId: 0, idDocumentId: 0, idNo: 0, bookingAgentId: 0, planId: 0,
                guestCount: 0, guestMaleCount: 0, guestFemaleCount: 0, 
                name: 0, fatherName: 0, age: 0, address: 0, 
                city: 0, policeStation: 0, state: 0, pin: 0, phone: 0, mobile: 0, email: 0,
                guestCount: 0, corporateName: 0, corporateAddress: 0, gstNo: 0,
                miscellaneousesDetail: 0, tablesDetail: 0, servicesDetail: 0,
                expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                option: 0, isActive: 0, isEnable: 0, updatedDate: 0, __v: 0
            }
        };
        const pipeline = [filter1, filter2];
        const resRoomsDetail = await aggregate(pipeline);  
        if (!resRoomsDetail) return res.status(404).send();

        if (resRoomsDetail[0].roomsDetail.length > 0) {
            // get previous balance
            prvBalanceDb = resRoomsDetail[0].balance;

            for (const room of resRoomsDetail[0].roomsDetail) {
                roomsDb.push(room);

                // previous room price
                prvRoomBalance += room.totalPrice;
            }
        }

        // remove all "M" and "R" from arrary
        let roomsArray = [];
        for (const room of rooms) {        
            if (room) {
                if (((room.operation) === 'M') || ((room.operation) === 'R')) {
                    roomsDb.filter((item) => {
                        if (!item._id.equals(room.transactionId)) {
                            roomsArray.push(item);
                        }
                    })
                }
            }
        }

        if (roomsArray.length > 0) {
            roomsDb = roomsArray;
        }

        // insert all "A" and "M" to array
        for (const room of rooms) {       
            if (room) {
                if (((room.operation) === 'A') || ((room.operation) === 'M')) {
                    
                    // check for room existance
                    const foundRoom = await _findOne(
                        {
                            _id: mongoose.Types.ObjectId(room.id), 
                            hotelId: hotelId, 
                            isEnable: true
                        }
                    );    
                    if (!foundRoom) return res.status(404).send();

                    if (foundRoom) {
                        const unitPrice = foundRoom.tariff +
                                        (room.extraBedCount * foundRoom.extraBedTariff) + 
                                        (room.extraPersonCount * foundRoom.extraPersonTariff) -
                                        room.discount;
            
                        const gstPercentage = await _search(unitPrice);

                        roomsDb.push(new roomType(
                            foundRoom.id, 
                            foundRoom.no, 
                            foundRoom.tariff,
                            room.extraBedCount, 
                            foundRoom.extraBedTariff,
                            room.extraPersonCount, 
                            foundRoom.extraPersonTariff,
                            room.discount, 
                            foundRoom.maxDiscount, 
                            gstPercentage,
                            room.occupancyDate
                        ));
                    }
                }
            }
        }

        // update the array to the db
        if (roomsDb.length > 0) {  
            
            // calculate current room price total
            for (const room of roomsDb) {
                roomBalance += room.totalPrice;
            }  

            // calculate current balance
            balanceDb = prvBalanceDb - prvRoomBalance + roomBalance;

            const resRoomUpdate = await updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId), 
                    hotelId,
                    isActive: true,
                    isEnable: true
                },
                {
                    $set: {
                        roomsDetail: roomsDb,
                        balance: balanceDb
                    }
                }
            );  
            if (!resRoomUpdate) return res.status(404).send();

            // remove room transaction
            const resDelete = deleteMany({hotelId, guestId});

            // insert room transaction
            for (const room of roomsDb) {
                const data = new GuestRoomTransaction({
                    hotelId:  hotelId,
                    guestId: guestId,
                    roomId: room.id,
                    no: room.no,
                    tariff: room.tariff,
                    extraBedCount: room.extraBedCount,
                    extraBedTariff: room.extraBedTariff,
                    extraPersonCount: room.extraPersonCount,
                    extraPersonTariff: room.extraPersonTariff,
                    discount: room.discount,
                    maxDiscount: room.maxDiscount,
                    gstPercentage: room.gstPercentage,
                    gstCharge: room.gstCharge,
                    totalPrice: room.totalPrice,
                    occupancyDate: room.occupancyDate
                });
        
                const resAdd = await data.save();
                if (!resAdd) return res.status(400).send();
            }  
        }

        // remove room expense from guest
        const resExpenseRemove = await updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId)
            },
            {
                $pull: {
                    expensesPaymentsDetail: {$elemMatch: {type: 'R'}}
                }
            }
        );    
        if (!resExpenseRemove) return res.status(400).send();

        // insert room expense into guest
        const resExpenseUpdate = await updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId),
            },
            {
                $push: {
                    'expensesPaymentsDetail': new expenseTransactionType(balanceDb)
                }
            }
        );    
        if (!resExpenseUpdate) return res.status(400).send();

        return res.status(200).send();
    } catch(e) {
        return res.status(500).send(e);
    }
};


module.exports = {
    handelSearch,
    handelDetail,
    handelCreate,
};