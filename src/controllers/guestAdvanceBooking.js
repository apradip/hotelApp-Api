const mongoose = require("mongoose");
const Hotel = require("./hotels");
// const GST = require("./gsts");
// const Guest = require("../models/guests");
// const Rooms = require("../models/rooms");
// const GuestRoomTransaction = require("../models/guestRoomsTransaction");
// const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
// const GuestExpensePayment = require("../models/guestExpensesPaymentsTransaction");
// const Plan = require("./plans");
// const BookingAgent = require("./bookingAgents");


// class roomType {
//     constructor(id, no, tariff, extraPersonTariff, extraBedTariff, maxDiscount, 
//                 extraPersonCount, extraBedCount, discount, occupancyDate, gstPercentage) {

//         const unitPrice = tariff + 
//                           (extraBedCount * extraBedTariff) + 
//                           (extraPersonCount * extraPersonTariff) -
//                           discount;
//         const gstCharge = unitPrice * (gstPercentage / 100);                          
//         const totalPrice = unitPrice + gstCharge;            

//         this.id = id,
//         this.no = no,
//         this.tariff = tariff.toFixed(0),
//         this.extraPersonTariff = extraPersonTariff.toFixed(0),
//         this.extraBedTariff = extraBedTariff.toFixed(0),
//         this.maxDiscount = maxDiscount.toFixed(0),
//         this.gstPercentage = gstPercentage.toFixed(0),
//         this.extraPersonCount = extraPersonCount,
//         this.extraBedCount = extraBedCount,
//         this.discount = discount.toFixed(0),
//         this.gstCharge = gstCharge.toFixed(0),
//         this.totalPrice = totalPrice.toFixed(0),
//         this.occupancyDate = occupancyDate
//     }
// };
// class roomTransactionType {
//     constructor(rooms) {
//         this.rooms = rooms
//         this.isCheckedout = false
//     }
// };
// class expenseType {
//     constructor(expenseId, billNo, expenseAmount) {
//         this.billNo = billNo,
//         this.type = "R",
//         this.expenseId = expenseId,
//         this.expenseAmount = expenseAmount.toFixed(0),
//         this.narration = "Expense for the rooms."
//     };
// };
// class guestType {
//     constructor(id, idDocumentId, idNo, name, age, fatherName, address, city, policeStation, state, pin, phone, mobile, email, 
//         guestCount, guestMaleCount, guestFemaleCount, corporateName, corporateAddress, gstNo, 
//         dayCount, bookingAgent, plan, balance, inDate, outDate, option, transactionId = undefined, 
//         rooms = []) {
//         this.id = id,
//         this.idDocumentId = idDocumentId,
//         this.idNo = idNo,
//         this.name = name,
//         this.age = age,
//         this.fatherName = fatherName,
//         this.address = address,
//         this.city = city,
//         this.policeStation = policeStation,
//         this.state = state,
//         this.pin = pin,
//         this.phone = phone,
//         this.mobile = mobile,
//         this.email = email,
//         this.guestCount = guestCount,
//         this.guestMaleCount = guestMaleCount,
//         this.guestFemaleCount = guestFemaleCount,
//         this.corporateName = corporateName,
//         this.corporateAddress = corporateAddress,
//         this.gstNo = gstNo,
//         this.dayCount = dayCount,    
//         this.bookingAgent = bookingAgent,
//         this.plan = plan,
//         this.balance = balance,
//         this.inDate = inDate,
//         this.outDate = outDate,
//         this.option = option,
//         this.transactionId = transactionId,
//         this.rooms = rooms
//     };
// }; 
// class billType {
//     constructor(expenseId = "", billId = "", rooms = [], expense, isPaid) {
//         this.expenseId = expenseId,
//         this.billId = billId,
//         this.rooms = rooms, 
//         this.expense = expense,
//         this.isPaid = isPaid
//     };
// };
// class paymentTransactionType {
//     constructor(expenseId, amount, narration) {
//         this.type = "P",
//         this.expenseId = expenseId,
//         this.paymentAmount = amount,
//         this.narration = narration,
//         this.paymentStatus = true
//     }
// };


// handel booking
// url : hotel Id
// body : {"bookings": [{"name": "", 
                        // "phone": "", 
                        // "startDate": "dd/mm/yyyy", 
                        // "dayCount": 0, 
                        // "roomCategoryId": "", 
                        // "guestCount": 0, 
                        // "roomCount":0}]}
const handelAdvanceBooking = async (req, res) => { 
    try {
        const {hotelId} = req.params;
        const {name, phone, categoryId, roomCount, arrivalDate, dayCount} = req.body;
    
        console.log(hotelId);
        console.log(name);
        console.log(phone);
        console.log(categoryId);
        console.log(roomCount);
        console.log(arrivalDate);
        console.log(dayCount);
    
        // get hotel tax details    
        // const hotel = await Hotel.detail(hotelId);

    //     if (transactionId === "NAN") {
    //         activeTransactionId = await getActiveId(hotelId, guestId);
    //     } else {
    //         activeTransactionId = transactionId;
    //     }

    //     if (transactionId) {
    //         const filter1 = {
    //             $match: {
    //                 _id: mongoose.Types.ObjectId(guestId),         
    //                 hotelId,
    //                 isActive: true,
    //                 isEnable: true
    //             }
    //         };
    //         const filter2 = {
    //             $unwind: "$roomsDetail"
    //         };
    //         const filter3 = {
    //             $match: {
    //                 "roomsDetail._id": mongoose.Types.ObjectId(transactionId)
    //             }
    //         };

    //         const guests = await Guest.aggregate([filter1, filter2, filter3]);  
    //         if (!guests) return;
            
    //         dbBooking = guests[0].roomsDetail.rooms;

    //         await Promise.all(bookings.map(async (booking, idx) => {    
    //             if (booking.id === "") 
    //                 bookings[idx].operation = "R";
            
    //             if (((booking.operation) === "M") || ((booking.operation) === "R")) {
    //                 const keyToFind = "id";
    //                 const valueToFind = booking.id;
    //                 dbBooking = dbBooking.filter(obj => obj[keyToFind] !== valueToFind);
    //             }
    //         }));

    //         await Promise.all(bookings.map(async (booking) => {    
    //             if (booking.operation === "A" || booking.operation === "M") {
                    
    //                 // check for item existance
    //                 const filter = {
    //                     _id: mongoose.Types.ObjectId(booking.id), 
    //                     hotelId, 
    //                     // isOccupied: false, 
    //                     isEnable: true
    //                 };
        
    //                 const foundRoom = await Rooms.findOne(filter);
        
    //                 if (!foundRoom) return;

    //                 const update = {
    //                     guestId: guestId,
    //                     guestCount: Number(foundRoom.accommodation) + Number(booking.extraPerson),
    //                     isOccupied: true
    //                 };

    //                 const resRoomUpdate = await Rooms.updateOne(filter, update);
    //                 if (!resRoomUpdate) return res.status(404).send();
                    
    //                 dbBooking.push(new roomType(
    //                     foundRoom._id, 
    //                     foundRoom.no, 
    //                     foundRoom.tariff,
    //                     foundRoom.extraPersonTariff,
    //                     foundRoom.extraBedTariff,
    //                     foundRoom.maxDiscount,
    //                     booking.extraPerson,
    //                     booking.extraBed,
    //                     booking.discount,
    //                     booking.occupancyDate,
    //                     await GST.search((foundRoom.tariff - booking.discount) + 
    //                         (foundRoom.extraPersonTariff * booking.extraPerson) +
    //                         (foundRoom.extraBedTariff * booking.extraBed))
    //                 ));
    //             }
    //         }));

    //         await Guest.updateOne(
    //             {
    //                 _id: mongoose.Types.ObjectId(guestId), 
    //                 hotelId,
    //                 isActive: true,
    //                 isEnable: true
    //             },
    //             {
    //                 $set: {
    //                     "roomsDetail.$[ed].rooms": dbBooking
    //                 }
    //             },
    //             { 
    //                 arrayFilters: [{
    //                     "ed._id": mongoose.Types.ObjectId(transactionId)
    //                 }]           
    //             }
    //         );  

    //         //append the current product to transaction document
    //         await Promise.all(dbBooking.map(async (room) => {     
    //             const data = new GuestRoomTransaction({
    //                 hotelId,
    //                 guestId,
    //                 id: room.id,
    //                 no: room.no,
    //                 tariff: room.tariff,
    //                 extraPersonTariff: room.extraPersonTariff,
    //                 extraBedTariff: room.extraBedTariff,
    //                 maxDiscount: room.maxDiscount,
    //                 gstPercentage: room.gstPercentage,
    //                 extraPersonCount: room.extraPersonCount,
    //                 extraBedCount: room.extraBedCount,
    //                 discount: room.discount,
    //                 gstCharge: room.gstCharge,
    //                 totalPrice: room.totalPrice,
    //                 occupancyDate: room.occupancyDate
    //             });
        
    //             await data.save();
    //         }));   
    //     } else {
    //         dbBooking = await newRoomValues(hotel, guestId, bookings);

    //         await Guest.updateOne(
    //             {
    //                 _id: mongoose.Types.ObjectId(guestId), 
    //                 hotelId,
    //                 isActive: true,
    //                 isEnable: true
    //             },
    //             {
    //                 $push: {
    //                     roomsDetail: dbBooking
    //                 }
    //             }
    //         );  

    //         //append the current product to transaction document
    //         await Promise.all(dbBooking.rooms.map(async (room) => {     
    //             const data = new GuestRoomTransaction({
    //                 hotelId,
    //                 guestId,
    //                 id: room.id,
    //                 no: room.no,
    //                 tariff: room.tariff,
    //                 extraPersonTariff: room.extraPersonTariff,
    //                 extraBedTariff: room.extraBedTariff,
    //                 maxDiscount: room.maxDiscount,
    //                 gstPercentage: room.gstPercentage,
    //                 extraPersonCount: room.extraPersonCount,
    //                 extraBedCount: room.extraBedCount,
    //                 discount: room.discount,
    //                 gstCharge: room.gstCharge,
    //                 totalPrice: room.totalPrice,
    //                 occupancyDate: room.occupancyDate
    //             });
    
    //             await data.save();
    //         }));   
    //     }
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
}


module.exports = {
    handelAdvanceBooking
};