const mongoose = require("mongoose");
const Hotel = require("./hotels");
const GST = require("./gsts");
const Guest = require("../models/guests");
const Rooms = require("../models/rooms");
const GuestRoomTransaction = require("../models/guestRoomsTransaction");
const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
const GuestExpensePayment = require("../models/guestExpensesPaymentsTransaction");
const Plan = require("./plans");
const BookingAgent = require("./bookingAgents");


class roomType {
    constructor(id, no, tariff, extraPersonTariff, extraBedTariff, maxDiscount, 
                extraPersonCount, extraBedCount, discount, occupancyDate, gstPercentage) {

        const unitPrice = tariff + 
                          (extraBedCount * extraBedTariff) + 
                          (extraPersonCount * extraPersonTariff) -
                          discount;
        const gstCharge = unitPrice * (gstPercentage / 100);                          
        const totalPrice = unitPrice + gstCharge;            

        this.id = id,
        this.no = no,
        this.tariff = tariff.toFixed(0),
        this.extraPersonTariff = extraPersonTariff.toFixed(0),
        this.extraBedTariff = extraBedTariff.toFixed(0),
        this.maxDiscount = maxDiscount.toFixed(0),
        this.gstPercentage = gstPercentage.toFixed(0),
        this.extraPersonCount = extraPersonCount,
        this.extraBedCount = extraBedCount,
        this.discount = discount.toFixed(0),
        this.gstCharge = gstCharge.toFixed(0),
        this.totalPrice = totalPrice.toFixed(0),
        this.occupancyDate = occupancyDate
    }
};
class roomTransactionType {
    constructor(rooms) {
        this.rooms = rooms
        this.isCheckedout = false
    }
};
class expenseType {
    constructor(expenseId, billNo, expenseAmount) {
        this.billNo = billNo,
        this.type = "R",
        this.expenseId = expenseId,
        this.expenseAmount = expenseAmount.toFixed(0),
        this.narration = "Expense for the rooms."
    };
};
class guestType {
    constructor(id, idDocumentId, idNo, name, age, fatherName, address, city, policeStation, state, pin, phone, mobile, email, 
        guestCount, guestMaleCount, guestFemaleCount, corporateName, corporateAddress, gstNo, 
        dayCount, bookingAgent, plan, balance, inDate, outDate, option, transactionId = undefined, 
        rooms = []) {
        this.id = id,
        this.idDocumentId = idDocumentId,
        this.idNo = idNo,
        this.name = name,
        this.age = age,
        this.fatherName = fatherName,
        this.address = address,
        this.city = city,
        this.policeStation = policeStation,
        this.state = state,
        this.pin = pin,
        this.phone = phone,
        this.mobile = mobile,
        this.email = email,
        this.guestCount = guestCount,
        this.guestMaleCount = guestMaleCount,
        this.guestFemaleCount = guestFemaleCount,
        this.corporateName = corporateName,
        this.corporateAddress = corporateAddress,
        this.gstNo = gstNo,
        this.dayCount = dayCount,    
        this.bookingAgent = bookingAgent,
        this.plan = plan,
        this.balance = balance,
        this.inDate = inDate,
        this.outDate = outDate,
        this.option = option,
        this.transactionId = transactionId,
        this.rooms = rooms
    };
}; 
class billType {
    constructor(expenseId = "", billId = "", rooms = [], expense, isPaid) {
        this.expenseId = expenseId,
        this.billId = billId,
        this.rooms = rooms, 
        this.expense = expense,
        this.isPaid = isPaid
    };
};
class paymentTransactionType {
    constructor(expenseId, amount, narration) {
        this.type = "P",
        this.expenseId = expenseId,
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

    let guestList = [];
    let pipeline = [];

    try {
        const filter1 = {
            $match: {
                hotelId,
                isActive: true,
                isEnable: true,
                outDate: {$exists:false},
                option: "R"
            }
        };
        const filter2 = {
            $match: {
                $or: [{name: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                {fatherName: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                {address: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                {city: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                {policeStation: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                {state: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                {pin: {$regex: ".*" + search.trim() + ".*"}},                
                {mobile: {$regex: ".*" + search.trim() + ".*"}},
                {corporateName: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                {corporateAddress: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                {roomNos: {$regex: ".*" + search.trim() + ".*"}}]
            }
        };
        const filter3 = {
            $sort: {
                inDate: 1, 
                name: 1
            }
        };

        if (!search)
            pipeline = [filter1, filter3];
        else 
            pipeline = [filter1, filter2, filter3];

        const dbGuests = await Guest.aggregate(pipeline); 
        await Promise.all(dbGuests.map(async (guest) => {
            guestList.push(new guestType(
                guest._id,
                guest.idDocumentId,
                guest.idNo,
                guest.name,
                guest.age,
                guest.fatherName,
                guest.address,
                guest.city,
                guest.policeStation,
                guest.state,
                guest.pin,
                guest.phone,
                guest.mobile,
                guest.email,
                guest.guestCount,
                guest.guestMaleCount,
                guest.guestFemaleCount,
                guest.corporateName,
                guest.corporateAddress,
                guest.gstNo,
                guest.dayCount,
                await BookingAgent.getName(guest.bookingAgentId),
                await Plan.getName(hotelId, guest.planId),
                guest.balance,
                await getCheckInDate(hotelId, guest._id),
                await getCheckOutDate(hotelId, guest._id),
                guest.option,
                undefined,
                await getActiveRooms(hotelId, guest._id),
            ));
        }));
    } catch(e) {
        return res.status(500).send(e);
    }

    // console.log(guestList);
    return res.status(200).send(guestList);
};


// handel show all rooms
// url : hotel Id / guest Id 
// query string : ?option = option: [non alloted / all]
const handelDetail = async (req, res) => {
    const {hotelId, guestId} = req.params;
    const option = req.query.option;

    let guest = undefined;
    let pipeline = [];

    try {
        const filter1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filter2 = {
            $unwind: "$roomsDetail"
        };
        const filter3 = { 
            $match: {"roomsDetail.isCheckedout": false}
        };
        const filter4 = { 
            $unwind: "$roomsDetail.rooms"
        };
        const filter5 = {
            $match: {"roomsDetail.rooms.checkoutDate": {$exists: false}}
        };

        // get guest detail
        pipeline = [filter1];
        const dbGuest = await Guest.aggregate(pipeline);  
        if (dbGuest.length > 0) {
            guest = new guestType(
                dbGuest[0]._id,
                dbGuest[0].idDocumentId,
                dbGuest[0].idNo,
                dbGuest[0].name,
                dbGuest[0].age,
                dbGuest[0].fatherName,
                dbGuest[0].address,
                dbGuest[0].city,
                dbGuest[0].policeStation,
                dbGuest[0].state,
                dbGuest[0].pin,
                dbGuest[0].phone ? dbGuest[0].phone : "",
                dbGuest[0].mobile,
                dbGuest[0].email,
                dbGuest[0].guestCount,
                dbGuest[0].guestMaleCount,
                dbGuest[0].guestFemaleCount,
                dbGuest[0].corporateName,
                dbGuest[0].corporateAddress,
                dbGuest[0].gstNo,
                dbGuest[0].dayCount,
                await BookingAgent.getName(dbGuest[0].bookingAgentId),
                await Plan.getName(hotelId, dbGuest[0].planId),
                dbGuest[0].balance,
                await getCheckInDate(hotelId, guestId),
                await getCheckOutDate(hotelId, guestId),
                dbGuest[0].option
            );
        }

        // get active transaction id
        guest.transactionId = await getActiveId(hotelId, guestId);
        
        // get all active transaction items
        if (option === "A") 
            pipeline = [filter1, filter2, filter3, filter4];
        else if (option === "N") 
            pipeline = [filter1, filter2, filter3, filter4, filter5];

        const dbItems = await Guest.aggregate(pipeline);  
        await Promise.all(dbItems.map(async (dbItem) => {    
            const item = dbItem.roomsDetail.rooms;
            
            guest.rooms.push({
                itemTransactionId: item._id,
                id: item.id,
                no: item.no,
                tariff: item.tariff,
                extraPersonTariff: item.extraPersonTariff,
                extraBedTariff: item.extraBedTariff,
                maxDiscount: item.maxDiscount,
                gstPercentage: item.gstPercentage,
                extraPerson: item.extraPersonCount,
                extraBed: item.extraBedCount,
                discount: item.discount,
                gstCharge: item.gstCharge,
                finalTariff: item.totalPrice,
                occupancyDate: item.occupancyDate
            });
        }));
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(guest);
};

    
// handel booking
// url : hotel Id / guest Id / transaction Id
// body : {"bookings": [{"id": "", "extraPersonCount": 0, "extraBedCount": 0, "discount": 0,
//         "occupancyDate": "dd/mm/yyyy", "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelBooking = async (req, res) => { 
    const {hotelId, guestId, transactionId} = req.params;
    const {bookings} = req.body;

    let dbBooking = undefined;

    try {
        // get hotel tax details    
        const hotel = await Hotel.detail(hotelId);

        if (transactionId !== "undefined") {
            if (!transactionId) return;

            if (transactionId) {
                const filter1 = {
                    $match: {
                        _id: mongoose.Types.ObjectId(guestId),         
                        hotelId,
                        isActive: true,
                        isEnable: true
                    }
                };
                const filter2 = {
                    $unwind: "$roomsDetail"
                };
                const filter3 = {
                    $match: {
                        "roomsDetail._id": mongoose.Types.ObjectId(transactionId)
                    }
                };

                const guests = await Guest.aggregate([filter1, filter2, filter3]);  
                if (!guests) return;
                
                dbBooking = guests[0].roomsDetail.rooms;

                await Promise.all(bookings.map(async (booking, idx) => {    
                    if (booking.id === "") 
                        bookings[idx].operation = "R";
                
                    if (((booking.operation) === "M") || ((booking.operation) === "R")) {
                        const keyToFind = "id";
                        const valueToFind = booking.id;
                        dbBooking = dbBooking.filter(obj => obj[keyToFind] !== valueToFind);
                    }
                }));

                await Promise.all(bookings.map(async (booking) => {    
                    if (booking.operation === "A" || booking.operation === "M") {
                        
                        // check for item existance
                        const filter = {
                            _id: mongoose.Types.ObjectId(booking.id), 
                            hotelId, 
                            // isOccupied: false, 
                            isEnable: true
                        };
            
                        const foundRoom = await Rooms.findOne(filter);
            
                        if (!foundRoom) return;

                        const update = {
                            guestId: guestId,
                            guestCount: Number(foundRoom.accommodation) + Number(booking.extraPerson),
                            isOccupied: true
                        };

                        const resRoomUpdate = await Rooms.updateOne(filter, update);
                        if (!resRoomUpdate) return res.status(404).send();
                        
                        dbBooking.push(new roomType(
                            foundRoom._id, 
                            foundRoom.no, 
                            foundRoom.tariff,
                            foundRoom.extraPersonTariff,
                            foundRoom.extraBedTariff,
                            foundRoom.maxDiscount,
                            booking.extraPerson,
                            booking.extraBed,
                            booking.discount,
                            booking.occupancyDate,
                            await GST.search((foundRoom.tariff - booking.discount) + 
                                (foundRoom.extraPersonTariff * booking.extraPerson) +
                                (foundRoom.extraBedTariff * booking.extraBed))
                        ));
                    }
                }));

                await Guest.updateOne(
                    {
                        _id: mongoose.Types.ObjectId(guestId), 
                        hotelId,
                        isActive: true,
                        isEnable: true
                    },
                    {
                        $set: {
                            "roomsDetail.$[ed].rooms": dbBooking
                        }
                    },
                    { 
                        arrayFilters: [{
                            "ed._id": mongoose.Types.ObjectId(transactionId)
                        }]           
                    }
                );  

                //append the current product to transaction document
                await Promise.all(dbBooking.map(async (room) => {     
                    const data = new GuestRoomTransaction({
                        hotelId,
                        guestId,
                        id: room.id,
                        no: room.no,
                        tariff: room.tariff,
                        extraPersonTariff: room.extraPersonTariff,
                        extraBedTariff: room.extraBedTariff,
                        maxDiscount: room.maxDiscount,
                        gstPercentage: room.gstPercentage,
                        extraPersonCount: room.extraPersonCount,
                        extraBedCount: room.extraBedCount,
                        discount: room.discount,
                        gstCharge: room.gstCharge,
                        totalPrice: room.totalPrice,
                        occupancyDate: room.occupancyDate
                    });
            
                    await data.save();
                }));   
            }
        } else {
            dbBooking = await newRoomValues(hotel, guestId, bookings);

            await Guest.updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId), 
                    hotelId,
                    isActive: true,
                    isEnable: true
                },
                {
                    $push: {
                        roomsDetail: dbBooking
                    }
                }
            );  

            //append the current product to transaction document
            await Promise.all(dbBooking.rooms.map(async (room) => {     
                const data = new GuestRoomTransaction({
                    hotelId,
                    guestId,
                    id: room.id,
                    no: room.no,
                    tariff: room.tariff,
                    extraPersonTariff: room.extraPersonTariff,
                    extraBedTariff: room.extraBedTariff,
                    maxDiscount: room.maxDiscount,
                    gstPercentage: room.gstPercentage,
                    extraPersonCount: room.extraPersonCount,
                    extraBedCount: room.extraBedCount,
                    discount: room.discount,
                    gstCharge: room.gstCharge,
                    totalPrice: room.totalPrice,
                    occupancyDate: room.occupancyDate
                });
        
                await data.save();
            }));   
        }
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
}


// handle generate bill & display detail
// url : hotel Id / guest Id / transaction Id
const handelGenerateBill = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;
   
    let dbRoomExpenseList = undefined;
    let total = 0;

    try {
        // Start :: calculate rooms price total
        const filterSum1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterSum2 = {
            $unwind: "$roomsDetail"
        };
        const filterSum3 = {
            $match: {
                "roomsDetail._id": mongoose.Types.ObjectId(transactionId)
            }
        };
        const filterSum4 = { 
            $unwind: "$roomsDetail.rooms" 
        };  
        const filterSum5 = {
            $match: {
                "roomsDetail.rooms.occupancyDate": {$exists:true}
            }
        };
        const filterSum6 = {
            $group: {
                _id: "$roomsDetail._id",
                total: {$sum: "$roomsDetail.rooms.totalPrice"}
            }
        };

        const dbSum = await Guest.aggregate([filterSum1, filterSum2, filterSum3, filterSum4, filterSum5, filterSum6]);
        // End :: calculate rooms price total

        // Start :: insert into expense if the transaction is not in guest 
        if (dbSum.length > 0) {
            total = (dbSum[0].total.toFixed(0) * -1);

            // Start :: update expense in guest
            const update = await Guest.updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId),
                    expensesPaymentsDetail: {
                        $elemMatch: {
                            expenseId: transactionId
                        }
                    }
                },
                {
                    $set: {
                        "expensesPaymentsDetail.$.expenseAmount": total
                    }
                }
            );
            // End :: update expense in guest

            if (update.matchedCount === 0) {
                // get hotel last bill no
                let billNo = await Hotel.getLastBillNo(hotelId);
                billNo += 1; 
    
                // Start :: insert expense into guest
                await Guest.updateOne(
                    {
                        _id: mongoose.Types.ObjectId(guestId),
                        hotelId,
                        isActive: true,
                        isEnable: true
                    },
                    {
                        $push: {
                            "expensesPaymentsDetail": new expenseType(transactionId, billNo, total)
                        }
                    }
                );
                // End :: insert expense into guest
    
                // Start :: insert expense into expense transaction
                const expenseData = new GuestExpensesPaymentsTransaction({
                    hotelId,
                    guestId,
                    billNo: billNo,
                    type: "R",
                    expenseId: transactionId,
                    expenseAmount: total,
                    narration: "Expense for the rooms."
                });
        
                await expenseData.save();
                // End :: insert expense into expense transaction

                // set hotel last bill no
                await Hotel.setLastBillNo(hotelId, billNo);

            } else {
                // Start :: update expense payment transaction
                await GuestExpensesPaymentsTransaction.updateOne(
                    {
                        hotelId, 
                        isEnable: true,
                        expenseId: transactionId
                    },
                    {
                        $set: {
                            expenseAmount: total
                        }
                    }
                );   
                // End :: update expense payment transaction
            }
        }

        // Start :: calculate & update balance
        const filterBalance1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterBalance2 = {
            $unwind: "$expensesPaymentsDetail"
        };
        const filterBalance3 = {
            $group: {
                _id: "$roomsDetail._id",
                totalExpense: {$sum: "$expensesPaymentsDetail.expenseAmount"},
                totalPayment: {$sum: "$expensesPaymentsDetail.paymentAmount"}                        
            }
        };

        const dbBalance = await Guest.aggregate([filterBalance1, filterBalance2, filterBalance3]);
        if (!dbBalance) return;
        if (dbBalance.length === 0) return;
        
        let totalExpense = 0;
        let totalPayment = 0;

        await Promise.all(dbBalance.map(async (transaction, idx) => {
            totalExpense += transaction.totalExpense;
            totalPayment += transaction.totalPayment;
        }));

        const balance = totalExpense + totalPayment;

        // Start :: update balance
        await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId), 
                hotelId,
                isActive: true,
                isEnable: true
            },
            {
                $set: {
                    balance: balance.toFixed(0)
                }
            }
        );  
        // End :: update balance
        // End :: calculate & update balance

        // Start :: show all bill items 
        const filterRoom1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterRoom2 = {
            $unwind: "$roomsDetail"
        };
        const filterRoom3 = { 
            $unwind: "$roomsDetail.rooms" 
        };  
        const filterRoom4 = {
            $match: {
                "roomsDetail._id": mongoose.Types.ObjectId(transactionId)
            }
        };
        const filterRoom5 = {
            $group: {
                _id: "$roomsDetail._id",
                rooms: {$push: "$roomsDetail.rooms"}
            }
        };

        const dbRoomList = await Guest.aggregate([filterRoom1, filterRoom2, filterRoom3, filterRoom4, filterRoom5]);
        if (!dbRoomList) res.status(500).send(e);
        if (dbRoomList.length === 0) res.status(500).send(e);
        const expenseId = dbRoomList[0]._id;
        const rooms = dbRoomList[0].rooms;
        // End :: show all bill items     

        // Start :: show expense 
        const filterExpense1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterExpense2 = {
            $unwind: "$expensesPaymentsDetail"
        };
        const filterExpense3 = {
            $match: {
                "expensesPaymentsDetail.expenseId": transactionId,
                "expensesPaymentsDetail.type": "R"
            }
        };
        const filterExpense4 = {
            $group: {
                _id: "$expensesPaymentsDetail._id",
                expensesDetail: {$push: "$expensesPaymentsDetail"}
            }
        };
        
        const dbExpenseList = await Guest.aggregate([filterExpense1, filterExpense2, filterExpense3, filterExpense4]);
        if (!dbExpenseList) res.status(500).send(e);
        if (dbExpenseList.length === 0) res.status(500).send(e);
        const billId = dbExpenseList[0]._id;
        const expense = dbExpenseList[0].expensesDetail[0];
        // End :: show expense     

        // Start :: bill payment status
        const filterBill1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterBill2 = {
            $unwind: "$expensesPaymentsDetail"
        };
        const filterBill3 = {
            $match: {
                "expensesPaymentsDetail._id": dbExpenseList[0]._id,
                "expensesPaymentsDetail.type": {$ne: "P"}
            }
        };
        
        const dbBill = await Guest.aggregate([filterBill1, filterBill2, filterBill3]);
        if (!dbBill) res.status(500).send(e);
        if (dbBill.length === 0) res.status(500).send(e);
        const isPaid = dbBill[0].expensesPaymentsDetail.paymentStatus;
        // End :: bill payment status

        dbRoomExpenseList = new billType(
            expenseId,
            billId,
            rooms,
            expense,
            isPaid
        );
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(dbRoomExpenseList);    
};


//handel add payment
//query string : hotel Id / guest Id / expense Id / bill Id
//body : {"amount" : 0, "narration" : ""}
const handelPayment = async (req, res) => {
    const {hotelId, guestId, expenseId, billId} = req.params;
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
                    "expensesPaymentsDetail": new paymentTransactionType(expenseId, amount, narration)
                }
            }
        );   
        //End :: insert into guest expense payment 

        //Start :: update payment status in bill
        await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId), 
                hotelId,
                isActive: true,
                isEnable: true
            },
            {
                $set: {
                    "expensesPaymentsDetail.$[ele].paymentStatus": true 
                }
            },
            { 
                arrayFilters: [ 
                    {"ele._id": mongoose.Types.ObjectId(billId)}
                ]           
            }
        );  
        //End :: update payment status in bill

        //Start :: update checkout status in miscellaneaDetail
        await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId), 
                hotelId,
                isActive: true,
                isEnable: true
            },
            {
                $set: {
                    "miscellaneaDetail.$[ele].isCheckedout": true 
                }
            },
            { 
                arrayFilters: [ 
                    {"ele._id": mongoose.Types.ObjectId(expenseId)}
                ]           
            }
        );  
        //End :: update checkout status in miscellaneaDetail

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


// handle guest checkout 
// url : hotel Id / guest Id 
const handelCheckout = async (req, res) => {
    const {hotelId, guestId} = req.params;

    // try {
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
                roomsDetail: {
                    $slice: ["$roomsDetail", -1] 
                }
            }
        };

        const foundRoomDetails = await Guest.aggregate([filter1, filter2]);  
        //update all room guestid it null & occupied status is false
        await Promise.all(foundRoomDetails.map(async (item) => {
            await Promise.all(item.roomsDetail.map(async (roomDetail) => {
                await Promise.all(roomDetail.rooms.map(async (room) => {
                    await Rooms.findByIdAndUpdate(
                        mongoose.Types.ObjectId(room.id), 
                        {$set: {isOccupied: false, guestId: "", guestCount: 0}});  
                }));
            }));
        }));

        // update out date & time
        await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId),
                hotelId,
                option: "R",
                isActive: true,
                isEnable: true
            },
            {
                $set: {
                    outDate: new Date(), 
                    isActive: false
                }
            }
        );
    // } catch(e) {
    //     return res.status(500).send(e);
    // }

    return res.status(200).send();    
};


async function newRoomValues(hotel, guestId, bookings) {
    // insert all add items
    const transaction = new roomTransactionType([]);

    try {
        await Promise.all(bookings.map(async (room) => {         
            if (room.operation !== "A") return; 

            // check for item existance
            const filter = {
                _id: mongoose.Types.ObjectId(room.id), 
                // hotelId: hotel._id, 
                // isOccupied: false, 
                isEnable: true
            };

            const foundRoom = await Rooms.findOne(filter);

            if (!foundRoom) return;

            const update = {
                guestId: guestId,
                guestCount: Number(foundRoom.accommodation) + Number(room.extraPerson),
                isOccupied: true
            };

            const resRoomUpdate = await Rooms.updateOne(filter, update);
            if (!resRoomUpdate) return res.status(404).send();

            transaction.rooms.push(
                new roomType(
                    room.id, 
                    foundRoom.no, 
                    foundRoom.tariff,
                    foundRoom.extraPersonTariff,
                    foundRoom.extraBedTariff,
                    foundRoom.maxDiscount,
                    room.extraPerson,
                    room.extraBed,
                    room.discount,
                    room.occupancyDate,
                    await GST.search((foundRoom.tariff - room.discount) + 
                    (foundRoom.extraPersonTariff * room.extraPerson) +
                    (foundRoom.extraBedTariff * room.extraBed))
                ));
        }));
    } catch(e) {
        return;
    }

    return transaction;
};

async function getActiveId(hotelId, guestId) {
    let activeTransactionId = "undefined";
    
    try {
        const filter1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filter2 = {
            $unwind: "$roomsDetail"
        };
        const filter3 = {
            $match: {
                "roomsDetail.isCheckedout": false
            }
        };
        
        const guests = await Guest.aggregate([filter1, filter2, filter3]);
        if (!guests) return activeTransactionId; 
        if (guests.length === 0) return activeTransactionId;
        activeTransactionId = guests[0].roomsDetail._id.toHexString();
    } catch(e) {
        return e;
    }

    return activeTransactionId;
};

async function getActiveRooms(hotelId, guestId) {
    let rooms = undefined;
    
    try {
        const filter1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filter2 = {
            $unwind: "$roomsDetail"
        };
        const filter3 = {
            $match: {
                "roomsDetail.isCheckedout": false
            }
        };
        
        const guests = await Guest.aggregate([filter1, filter2, filter3]);

        if (!guests.length) return; 
        if (!guests[0].roomsDetail.rooms.length) return;
        rooms = guests[0].roomsDetail.rooms;
    } catch(e) {
        return;
    }

    return rooms;
};

async function getCheckInDate(hotelId, guestId) {
    let date = undefined;

    try {
        const filter1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filter2 = {
            $unwind: "$roomsDetail"
        };
        const filter3 = {
            $match: {"roomsDetail.isCheckedout": false}
        };
        const filter4 = {
            $unwind: "$roomsDetail.rooms"
        };
        const filter5 = {
            $sort: {"roomsDetail.rooms.occupancyDate": 1}
        };

        const chekin = await Guest.aggregate([filter1, filter2, filter3, filter4, filter5]).limit(1);

        if (!chekin.length) return; 
 
        date = chekin[0].roomsDetail.rooms.occupancyDate;
    } catch(e) {
        return;
    }

    return date;
};

async function getCheckOutDate(hotelId, guestId) {
    let date = undefined;

    try {
        const filter1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filter2 = {
            $unwind: "$roomsDetail"
        };
        const filter3 = {
            $match: {"roomsDetail.isCheckedout": false}
        };
        const filter4 = {
            $unwind: "$roomsDetail.rooms"
        };
        const filter5 = {
            $sort: {"roomsDetail.rooms.occupancyDate": -1}
        };

        const chekout = await Guest.aggregate([filter1, filter2, filter3, filter4, filter5]).limit(1);

        if (!chekout.length) return; 
 
        date = chekout[0].roomsDetail.rooms.occupancyDate;
    } catch(e) {
        return;
    }

    return date;
};


module.exports = {
    handelSearch,
    handelDetail,
    handelBooking,
    handelGenerateBill,
    handelPayment,
    handelCheckout,
    getActiveId,
    getActiveRooms
};