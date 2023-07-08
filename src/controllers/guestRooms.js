const mongoose = require("mongoose");
const Hotel = require("./hotels");
const GST = require("./gsts");
const Guest = require("../models/guests");
const Rooms = require("../models/rooms");
const GuestRoomTransaction = require("../models/guestRoomsTransaction");
const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
const Plan = require("./plans");
const BookingAgent = require("./bookingAgents");
const date = require("date-and-time");

class roomType {
    constructor(id, no, tariff, extraPersonTariff, extraBedTariff, maxDiscount, 
                extraPersonCount, extraBedCount, discount, occupancyDate, gstPercentage) {

        const unitPrice = tariff + 
                          (extraBedCount * extraBedTariff) + 
                          (extraPersonCount * extraPersonTariff) -
                          discount;

        this.id = id;
        this.no = no;
        this.tariff = tariff;
        this.extraPersonTariff = extraPersonTariff;
        this.extraBedTariff = extraBedTariff;
        this.maxDiscount = maxDiscount;
        this.gstPercentage = gstPercentage;
        this.extraPersonCount = extraPersonCount;
        this.extraBedCount = extraBedCount;
        this.discount = discount;
        this.gstCharge = unitPrice * (gstPercentage / 100);
        this.totalPrice = unitPrice + this.gstCharge;
        this.occupancyDate = occupancyDate;
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
        this.expenseAmount = expenseAmount,
        this.narration = "Expense for the rooms."
    };
};

 
//handel search guest
//query string : hotel Id?search= guest name, father name, mobile, address, city, police station, state, pin 
const handelSearch = async (req, res) => {
    const hotelId = req.params.hotelId;
    const search = req.query.search;

    let itemList = [];
    let pipeline = [];

    try {
        const filter1 = {
            $match: {
                hotelId,
                isActive: true,
                isEnable: true,
                outDate: {$exists:false},
                outTime: {$exists:false},
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

        if (!search) {
            pipeline = [filter1];
        } else {
            pipeline = [filter1, filter2];
        }

        const guests = await Guest.aggregate(pipeline); 

        await Promise.all(guests.map(async (guest) => {
            let rooms = "";

            if (guest.roomsDetail.length > 0) {
                if (!search) {
                    rooms = guest.roomsDetail[guest.roomsDetail.length - 1].rooms;
                } else {
                    guest.roomsDetail[guest.roomsDetail.length - 1].rooms.map(async (room) => {
                        rooms.length > 0 ?  rooms = rooms + ", " + room.no : rooms = room.no;
                    });
                }
            }

            const object = {
                id: guest._id,
                transactionId: guest.roomsDetail.length > 0 ? guest.roomsDetail[guest.roomsDetail.length - 1]._id : "",            
                idDocumentId: guest.idDocumentId,
                idNo: guest.idNo,
                name: guest.name,
                age: guest.age,
                fatherName: guest.fatherName,
                address: guest.address,
                city: guest.city,
                policeStation: guest.policeStation,
                state: guest.state,
                pin: guest.pin,
                phone: guest.phone,
                mobile: guest.mobile,
                email: guest.email,
                guestCount: guest.guestCount,
                guestMaleCount: guest.guestMaleCount,
                guestFemaleCount: guest.guestFemaleCount,
                corporateName: guest.corporateName,
                corporateAddress: guest.corporateAddress,
                gstNo: guest.gstNo,
                dayCount: guest.dayCount,
                bookingAgent: await BookingAgent.getName(guest.bookingAgentId),
                plan: await Plan.getName(hotelId, guest.planId),
                rooms: rooms,   
                totalBalance: guest.balance,
                inDate: guest.inDate,
                inTime: guest.inTime
            };
            
            itemList.push(object);
        }));
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(itemList);
};


// handel show all rooms
// url : hotel Id / guest Id 
// query string : ?option = option: [non alloted / all]
const handelDetail = async (req, res) => {
    const {hotelId, guestId} = req.params;
    const option = req.query.option;

    let itemList = [];
    let pipeline = [];

    try {
        const filter1 = {
            $match: {
                hotelId,
                _id: mongoose.Types.ObjectId(guestId),         
                isActive: true,
                isEnable: true
            }
        };
        const filter2 = {
            $unwind: "$roomsDetail"
        };
        const filter3 = { 
            $unwind: "$roomsDetail.rooms"
        };
        const filter4 = {
            $match: {
                "roomsDetail.rooms.checkoutDate": {$exists: false},
                // "roomsDetail.rooms.checkoutTime": {$exists: false}
            }
        };

        if (option === "N") {
            pipeline = [filter1, filter2, filter3, filter4];
        } else if (option === "A") {
            pipeline = [filter1, filter2, filter3];
        } 

        const guests = await Guest.aggregate(pipeline);

        await Promise.all(guests.map(async (guest) => {    
            const transactionId = guest.roomsDetail._id;
            const item = guest.roomsDetail.rooms;
            
            const object = {
                transactionId: transactionId,
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
            };

            itemList.push(object);
        }));
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(itemList);
};

    
// handel booking
// url : hotel Id / guest Id / transaction Id
// body : {"bookings": [{"id": "", "extraPersonCount": 0, "extraBedCount": 0, "discount": 0,
//         "occupancyDate": "dd/mm/yyyy", "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelBooking = async (req, res) => { 
    const {hotelId, guestId, transactionId} = req.params;
    const {bookings} = req.body;

    let bookingDb = undefined;

    try {
        // get hotel tax details    
        const hotel = await Hotel.detail(hotelId);

        if (transactionId !== "undefined") {
            if (!transactionId) return;

            const filter1 = {
                $match: {
                    hotelId,
                    _id: mongoose.Types.ObjectId(guestId),         
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

            const dbTransactionItems = await Guest.aggregate([filter1, filter2, filter3]);  
            if (!dbTransactionItems) return;

            bookingDb = dbTransactionItems[0].roomsDetail.rooms;

            await Promise.all(bookings.map(async (booking, idx) => {    
                if (booking.id === "") {
                    bookings[idx].operation = "R";
                }   

                if (((booking.operation) === "M") || ((booking.operation) === "R")) {
                    const keyToFind = "id";
                    const valueToFind = booking.id;
                    bookingDb = bookingDb.filter(obj => obj[keyToFind] !== valueToFind);
                }
            }));

            await Promise.all(bookings.map(async (booking) => {    
                if (booking.operation !== "A" && booking.operation !== "M") return;
                    
                // check for item existance
                const master = await Rooms.findOne(
                    {
                        hotelId, 
                        _id: mongoose.Types.ObjectId(booking.id), 
                        isEnable: true
                    }
                );    
    
                if (!master) return;

                bookingDb.push(new roomType(master._id, 
                                            master.no, 
                                            master.tariff,
                                            master.extraPersonTariff,
                                            master.extraBedTariff,
                                            master.maxDiscount,
                                            booking.extraPerson,
                                            booking.extraBed,
                                            booking.discount,
                                            booking.occupancyDate,
                                            await GST.search((master.tariff - booking.discount) + 
                                                (master.extraPersonTariff * booking.extraPerson) +
                                                (master.extraBedTariff * booking.extraBed))));
            }));

            await Guest.updateOne(
                {
                    hotelId,
                    _id: mongoose.Types.ObjectId(guestId), 
                    isActive: true,
                    isEnable: true
                },
                {
                    $set: {
                        "roomsDetail.$[ed].rooms": bookingDb
                    }
                },
                { 
                    arrayFilters: [{
                        "ed._id": mongoose.Types.ObjectId(transactionId)
                    }]           
                }
            );  
        } else {
            bookingDb = await newRoomValues(hotel, bookings);

            await Guest.updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId), 
                    hotelId,
                    isActive: true,
                    isEnable: true
                },
                {
                    $push: {
                        roomsDetail: bookingDb
                    }
                },
            );  
        }

        //append the current product to transaction document
        await Promise.all(bookingDb.map(async (item) => {         
            const currentItem = item;

            // if (currentItem) {
                const data = new GuestRoomTransaction({
                    hotelId,
                    guestId,
                    id: currentItem.id,
                    no: currentItem.no,
                    tariff: currentItem.tariff,
                    extraPersonTariff: currentItem.extraPersonTariff,
                    extraBedTariff: currentItem.extraBedTariff,
                    maxDiscount: currentItem.maxDiscount,
                    gstPercentage: currentItem.gstPercentage,
                    extraPersonCount: currentItem.extraPersonCount,
                    extraBedCount: currentItem.extraBedCount,
                    discount: currentItem.discount,
                    gstCharge: currentItem.gstCharge,
                    totalPrice: currentItem.totalPrice,
                    occupancyDate: currentItem.occupancyDate,
                    // occupancyTime: currentItem.occupancyTime
                });
        
                await data.save();
            // }
        }));   
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
}


// handle generate bill & display detail
// url : hotel Id / guest Id / transaction Id
const handelGenerateBill = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;
   
    let total = 0;

    try {
        // Start :: calculate miscellanea item price total
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
                "roomsDetail.rooms.occupancyDate": {$exists:true},
                // "roomsDetail.rooms.occupancyTime": {$exists:true}
            }
        };
        const filterSum6 = {
            $group: {
                _id: "$roomsDetail._id",
                total: {$sum: "$roomsDetail.rooms.totalPrice"}
            }
        };

        const despatchSum = await Guest.aggregate([filterSum1, filterSum2, filterSum3, filterSum4, filterSum5, filterSum6]);
        // End :: calculate miscellanea item price total


        // Start :: insert into expense if the transaction is not in guest 
        if (despatchSum.length > 0) {
            total = (despatchSum[0].total.toFixed(0) * -1);

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
                        hotelId,
                        _id: mongoose.Types.ObjectId(guestId),
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
                const data = new GuestExpensesPaymentsTransaction({
                    hotelId,
                    guestId,
                    billNo: billNo,
                    type: "R",
                    expenseId: transactionId,
                    expenseAmount: total,
                    narration: "Expense for the rooms."
                });
        
                await data.save();
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
                hotelId,
                _id: mongoose.Types.ObjectId(guestId),         
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

        const balances = await Guest.aggregate([filterBalance1, filterBalance2, filterBalance3]);
        const balance = balances[0].totalExpense + balances[0].totalPayment

        // Start :: update balance
        await Guest.updateOne(
            {
                hotelId,
                _id: mongoose.Types.ObjectId(guestId), 
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
        const filterBill1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterBill2 = {
            $unwind: "$roomsDetail"
        };
        const filterBill3 = { 
            $unwind: "$roomsDetail.rooms" 
        };  
        const filterBill4 = {
            $unwind: "$expensesPaymentsDetail"
        };
        const filterBill5 = {
            $match: {
                "roomsDetail._id": mongoose.Types.ObjectId(transactionId),
                "expensesPaymentsDetail.expenseId": transactionId,
                "roomsDetail.rooms.occupancyDate": {$exists:true},
                // "roomsDetail.rooms.occupancyTime": {$exists:true}
            }
        };
        const filterBill6 = {
            $group: {
                _id: "$roomsDetail._id",
                miscellanea: {$push: "$roomsDetail.rooms"},
                expensesPaymentsDetail: {$push: "$expensesPaymentsDetail"}
            }
        };

        const bills = await Guest.aggregate([filterBill1, filterBill2, filterBill3, filterBill4, filterBill5, filterBill6]);

        return res.status(200).send(bills);    
        // End :: show all bill items     
    } catch(e) {
        return res.status(500).send(e);
    }
};


// handle guest checkout 
// url : hotel Id / guest Id / transaction Id
const handelCheckout = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;

    try {
        // update out date & time
        await Guest.updateOne(
            {
                hotelId,
                _id: mongoose.Types.ObjectId(guestId),
                isActive: true,
                isEnable: true,
                roomsDetail: {
                    $elemMatch: {
                        _id: mongoose.Types.ObjectId(transactionId)
                    }
                }
            },
            {
                $set: {
                    "roomsDetail.$.isCheckedout": true,
                    outDate: date.format(new Date(), "YYYY-MM-DD"), 
                    outTime: date.format(new Date(), "HH:mm"),
                    isActive: false
                }
            }
        );
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();    
};


async function newRoomValues(hotel, bookings) {
    // insert all add / modify operation items
    const transaction = new roomTransactionType([]);

    await Promise.all(bookings.map(async (booking) => {         
        if (booking.operation !== "A") return; 
        
        // if (((order.operation) === "A") || ((order.operation) === "M")) {

        // check for item existance
        const master = await Rooms.findOne(
            {
                _id: mongoose.Types.ObjectId(booking.id), 
                hotelId: hotel._id, 
                // isOccupied: false,
                isEnable: true
            }
        );    

        if (!master) return;

        transaction.rooms.push(
            new roomType(
                master._id, 
                master.no, 
                master.tariff,
                master.extraPersonTariff,
                master.extraBedTariff,
                master.maxDiscount,
                booking.extraPersonCount,
                booking.extraBedCount,
                booking.discount,
                booking.occupancyDate,
                await GST.search((master.tariff - booking.discount) + 
                (master.extraPersonTariff * booking.extraPersonCount) +
                (master.extraBedTariff * booking.extraBedCount))
        ));
    }));

    return transaction;
}


module.exports = {
    handelSearch,
    handelDetail,
    handelBooking,
    handelGenerateBill,
    handelCheckout,
};