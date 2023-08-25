const mongoose = require("mongoose");
const Hotel = require("./hotels");
const Guest = require("../models/guests");
const Services = require("../models/services");
const GuestServiceTransaction = require("../models/guestServicesTransaction");
const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
const GuestExpensePayment = require("../models/guestExpensesPaymentsTransaction");

const GuestRoom = require("./guestRooms");

class serviceType {
    constructor(id, name, unitPrice, quantity, serviceChargePercentage, gstPercentage) {
      this.id = id;
      this.name = name;
      this.unitPrice = unitPrice.toFixed(0);
      this.quantity = quantity;
      this.serviceChargePercentage = serviceChargePercentage.toFixed(2);
      this.gstPercentage = gstPercentage.toFixed(2);
    }
};
class serviceTransactionType {
    constructor(services) {
        this.services = services;
        this.isCheckedout = false;
    };
};
class expenseType {
    constructor(expenseId, billNo, expenseAmount) {
        this.billNo = billNo,
        this.type = "S",
        this.expenseId = expenseId,
        this.expenseAmount = expenseAmount.toFixed(0),
        this.narration = "Expense for the service items."
    };
};
class guestType {
    constructor(id, name, mobile, guestCount, corporateName, corporateAddress, 
        gstNo, balance, inDate, outDate = "", option, transactionId = undefined, 
        items = [], rooms = []) {
        this.id = id,
        this.name = name,
        this.mobile = mobile,
        this.guestCount = guestCount,
        this.corporateName = corporateName,
        this.corporateAddress = corporateAddress,
        this.gstNo = gstNo,
        this.balance = balance,
        this.inDate = inDate,
        this.outDate = outDate,
        this.option = option,
        this.transactionId = transactionId,
        this.items = items,
        this.rooms = rooms
    };
}; 
class billType {
    constructor(expenseId = "", billId = "", services = [], expense, isPaid) {
        this.expenseId = expenseId,
        this.billId = billId,
        this.services = services, 
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


// handel search guest
// url : hotel Id 
// query string : ?search= guest name, mobile, corporate name, corporate address
const handelSearch = async (req, res) => {
    const hotelId = req.params.hotelId;
    const search = req.query.search;
    const serviceOnly = req.query.serviceonly;

    let guestList = [];
    let pipeline = [];
    
    try {
        let filter1 = "";

        if (serviceOnly === "true") {
            filter1 = {
                $match: {
                    hotelId,
                    isActive: true,
                    isEnable: true,
                    outDate: {$exists:false},
                    option: "S"
                }};
        } else {
            filter1 = {
                $match: {
                    hotelId,
                    isActive: true,
                    isEnable: true,
                    outDate: {$exists:false},
                    $or: [{option: "R"}, {option: "S"}]
                }};
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
                inDate: 1, 
                name: 1
            }
        };

        search ? pipeline = [filter1, filter2, filter3] : pipeline = [filter1, filter3];
        const dbGuests = await Guest.aggregate(pipeline); 
        await Promise.all(dbGuests.map(async (guest) => {
            if (guest.option === "R") {
                guestList.push(new guestType(
                    guest._id,
                    guest.name,
                    guest.mobile,
                    guest.guestCount,
                    guest.corporateName,
                    guest.corporateAddress,
                    guest.gstNo,
                    guest.balance,
                    await getCheckInDate(hotelId, guest._id),
                    await getCheckOutDate(hotelId, guest._id),
                    guest.option,
                    undefined,
                    await getPendingOrderItems(hotelId, guest._id),
                    await GuestRoom.getActiveRooms(hotelId, guest._id)
                ));
            } else {
                guestList.push(new guestType(
                    guest._id,
                    guest.name,
                    guest.mobile,
                    guest.guestCount,
                    guest.corporateName,
                    guest.corporateAddress,
                    guest.gstNo,
                    guest.balance,
                    guest.inDate,
                    "",
                    guest.option,
                    undefined,
                    await getPendingOrderItems(hotelId, guest._id)
                ));
            }
        }));
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(guestList);
};


// handel show all service items
// url : hotel Id / guest Id 
// query string : ?option = option: [non delivery / all / all for this guest]
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
            $unwind: "$servicesDetail"
        };
        const filter3 = { 
            $match: {
                "servicesDetail.isCheckedout": false
            }
        };
        const filter4 = { 
            $unwind: "$servicesDetail.services"
        };
        const filter5 = {
            $match: {
                "servicesDetail.services.despatchDate": {$exists: false}
            }
        };

        // get guest detail
        pipeline = [filter1];
        const dbGuest = await Guest.aggregate(pipeline);  
        if (dbGuest.length > 0) {
            guest = new guestType(
                dbGuest[0]._id,
                dbGuest[0].name,
                dbGuest[0].mobile,
                dbGuest[0].guestCount,
                dbGuest[0].corporateName,
                dbGuest[0].corporateAddress,
                dbGuest[0].gstNo,
                dbGuest[0].balance,
                dbGuest[0].inDate,
                dbGuest[0].option
            );
        }
        
        // get active transaction id
        guest.transactionId = await getActiveId(hotelId, guestId);
        
        // get all active transaction items
        if (option === "GA")
            pipeline = [filter1, filter2, filter4];
        else if (option === "A") 
            pipeline = [filter1, filter2, filter3, filter4];
        else if (option === "N") 
            pipeline = [filter1, filter2, filter3, filter4, filter5];

        const dbItems = await Guest.aggregate(pipeline);  
        await Promise.all(dbItems.map(async (dbItem) => {    
            const item = dbItem.servicesDetail.services;
            
            guest.items.push({
                itemTransactionId: item._id,
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                serviceChargePercentage: item.serviceChargePercentage,
                serviceCharge: item.serviceCharge,
                gstPercentage: item.gstPercentage,
                gstCharge: item.gstCharge,
                totalPrice: item.totalPrice,
                orderDate: item.orderDate,
                despatchDate: item.despatchDate
            });
        }));
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(guest);
};


// handel order
// url : hotel Id / guest Id / transaction Id
// body : {"orders": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;
    const {orders} = req.body;

    let dbOrder = undefined;

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
                    $unwind: "$servicesDetail"
                };
                const filter3 = {
                    $match: {
                        "servicesDetail._id": mongoose.Types.ObjectId(transactionId)
                    }
                };

                const guests = await Guest.aggregate([filter1, filter2, filter3]);  
                if (!guests) return;
                dbOrder = guests[0].servicesDetail.services;

                await Promise.all(orders.map(async (order, idx) => {
                    if (order.quantity <= 0) 
                        orders[idx].operation = "R";

                    if (((order.operation) === "M") || ((order.operation) === "R")) {
                        const keyToFind = "id";
                        const valueToFind = order.id;
                        dbOrder = dbOrder.filter(obj => obj[keyToFind] !== valueToFind);
                    }
                }));

                await Promise.all(orders.map(async (order) => {    
                    if (((order.operation) === "A") || ((order.operation) === "M")) {
                        
                        // check for item existance
                        const master = await Services.findOne(
                            {
                                _id: mongoose.Types.ObjectId(order.id), 
                                hotelId, 
                                isEnable: true
                            }
                        );    
                        if (!master) return;

                        dbOrder.push(new serviceType(
                            master._id, 
                            master.name, 
                            master.price,
                            order.quantity,
                            hotel.serviceChargePercentage,
                            hotel.foodGstPercentage
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
                            "servicesDetail.$[ed].services": dbOrder
                        }
                    },
                    { 
                        arrayFilters: [{
                            "ed._id": mongoose.Types.ObjectId(transactionId)
                        }]           
                    }
                );  
            }
        } else {
            dbOrder = await newItemValues(hotel, orders);

            await Guest.updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId), 
                    hotelId,
                    isActive: true,
                    isEnable: true
                },
                {
                    $push: {
                        servicesDetail: dbOrder
                    }
                },
            );  
        }
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
};


// handel delivery
// url : hotel Id / guest Id / transaction Id
// body : {"deliveries": [{"id": ""}]}
const handelDelivery = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;
    const {deliveries} = req.body;

    let totalPriceAllInclusive = 0;

    try {
        await Promise.all(deliveries.map(async (delivery) => {         
            if (!delivery) return;

            // update all delivery date & time
            await Guest.updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId), 
                    hotelId,
                    isActive: true,
                    isEnable: true
                },
                {
                    $set: {
                        "servicesDetail.$[ele].services.$[sele].despatchDate": new Date()
                    }
                },
                { 
                    arrayFilters: [ 
                        {"ele._id": mongoose.Types.ObjectId(transactionId)},
                        {"sele._id": mongoose.Types.ObjectId(delivery.itemTransactionId)}
                    ]           
                }
            );  

            //append to transaction document
            //read current product detail from guest
            const filter1 = {
                $match: {
                    _id: mongoose.Types.ObjectId(guestId),         
                    hotelId,
                    isActive: true,
                    isEnable: true
                }
            };
            const filter2 = {
                $unwind: "$servicesDetail"
            };
            const filter3 = {
                $match: {
                    "servicesDetail._id": mongoose.Types.ObjectId(transactionId)
                }
            };
            const filter4 = { 
                $unwind: "$servicesDetail.services" 
            };  
            const filter5 = {
                $match: {
                    "servicesDetail.services._id": mongoose.Types.ObjectId(delivery.itemTransactionId),
                    "servicesDetail.services.despatchDate": {$exists:true}
                }
            };

            const dbItems = await Guest.aggregate([filter1, filter2, filter3, filter4, filter5]);

            //append the current product to transaction document
            await Promise.all(dbItems.map(async (guest) => {         
                const item = guest.servicesDetail.services;
                if (!item) return;

                totalPriceAllInclusive += item.totalPrice;

                const data = new GuestServiceTransaction({
                    hotelId,
                    guestId,
                    id: item.id,
                    name: item.name,
                    serviceChargePercentage: item.serviceChargePercentage,
                    serviceCharge: item.serviceCharge,
                    gstPercentage: item.gstPercentage,
                    gstCharge: item.gstCharge,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice,
                    orderDate: item.orderDate,
                    despatchDate: item.despatchDate
                });
        
                await data.save();
            }));   
        }));

        totalPriceAllInclusive = (totalPriceAllInclusive * -1);

        //Start :: update balance
        await Guest.findByIdAndUpdate(
            mongoose.Types.ObjectId(guestId), 
            {$inc: {balance: totalPriceAllInclusive.toFixed(0)}}
        );
        //End :: update balance
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
};


// handle generate bill & display detail
// query string : hotel Id / guest Id / transaction Id
const handelGenerateBill = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;
   
    let dbItemExpenseList = undefined;
    let total = 0;

    try {
        // Start :: calculate food total
        const filterSum1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterSum2 = {
            $unwind: "$servicesDetail"
        };
        const filterSum3 = {
            $match: {
                "servicesDetail._id": mongoose.Types.ObjectId(transactionId)
            }
        };
        const filterSum4 = { 
            $unwind: "$servicesDetail.services" 
        };  
        const filterSum5 = {
            $match: {
                "servicesDetail.services.despatchDate": {$exists:true}
            }
        };
        const filterSum6 = {
            $group: {
                _id: "$servicesDetail._id",
                total: {$sum: "$servicesDetail.services.totalPrice"}
            }
        };

        const dbSum = await Guest.aggregate([filterSum1, filterSum2, filterSum3, filterSum4, filterSum5, filterSum6]);
        // End :: calculate food total

        // Start :: insert into expense if the transaction is not in guest 
        if (dbSum.length > 0) {
            total = (dbSum[0].total.toFixed(0) * -1);

            // Start :: update expense in guest
            const dbUpdate = await Guest.updateOne(
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

            if (dbUpdate.matchedCount === 0) {
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
                    type: "S",
                    expenseId: transactionId,
                    expenseAmount: total,
                    narration: "Expense for the service items."
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

        // Start :: show all bill items 
        const filterItem1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterItem2 = {
            $unwind: "$servicesDetail"
        };
        const filterItem3 = { 
            $unwind: "$servicesDetail.services" 
        };  
        const filterItem4 = {
            $match: {
                "servicesDetail._id": mongoose.Types.ObjectId(transactionId),
                "servicesDetail.services.despatchDate": {$exists:true}
            }
        };
        const filterItem5 = {
            $group: {
                _id: "$servicesDetail._id",
                services: {$push: "$servicesDetail.services"}
            }
        };

        const dbItemList = await Guest.aggregate([filterItem1, filterItem2, filterItem3, filterItem4, filterItem5]);
        if (!dbItemList) res.status(500).send(e);
        if (dbItemList.length === 0) res.status(500).send(e);
        const expenseId = dbItemList[0]._id;
        const services = dbItemList[0].services;
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
                "expensesPaymentsDetail.type": "S"
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

        dbItemExpenseList = new billType(
            expenseId,
            billId,
            services,
            expense,
            isPaid
        );
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(dbItemExpenseList);    
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
                    "servicesDetail.$[ele].isCheckedout": true 
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
// query string : hotel Id / guest Id
const handelCheckout = async (req, res) => {
    const {hotelId, guestId} = req.params;

    try {
        // update out date & time
        await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId),
                hotelId,
                option: "S",
                balance: 0,
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
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();    
};


async function newItemValues(hotel, orders) {
    // insert all add / modify operation items
    const transaction = new serviceTransactionType([]);

    await Promise.all(orders.map(async (order) => {         
        if ((order.operation) !== "A") return;
                
        // check for item existance
        const master = await Services.findOne(
            {
                _id: mongoose.Types.ObjectId(order.id), 
                hotelId: hotel._id, 
                isEnable: true
            }
        );    

        if (!master) return;

        transaction.services.push(
            new serviceType(
                master._id, 
                master.name, 
                master.price,
                order.quantity,
                hotel.serviceChargePercentage,
                hotel.foodGstPercentage
            ));
    }));

    return transaction;
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
            $unwind: "$servicesDetail"
        };
        const filter3 = {
            $match: {
                "servicesDetail.isCheckedout": false
            }
        };
        
        const guests = await Guest.aggregate([filter1, filter2, filter3]);
        if (!guests) return; 
        if (guests.length === 0) return activeTransactionId;
        activeTransactionId = guests[0].servicesDetail._id.toHexString();
    } catch(e) {
        return e;
    }

    return activeTransactionId;
};

async function getPendingOrderItems (hotelId, guestId) {
    let items = [];

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
            $unwind: "$servicesDetail"
        };
        const filter3 = { 
            $match: {
                "servicesDetail.isCheckedout": false
            }
        };
        const filter4 = { 
            $unwind: "$servicesDetail.services"
        };
        const filter5 = {
            $match: {
                "servicesDetail.services.despatchDate": {$exists: false}
            }
        };
                
        const dbItems = await Guest.aggregate([filter1, filter2, filter3, filter4, filter5]);

        await Promise.all(dbItems.map(async (dbItem) => {    
            const item = dbItem.servicesDetail.services;

            items.push({
                itemTransactionId: item._id,
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                serviceChargePercentage: item.serviceChargePercentage,
                serviceCharge: item.serviceCharge,
                gstPercentage: item.gstPercentage,
                gstCharge: item.gstCharge,
                totalPrice: item.totalPrice,
                orderDate: item.orderDate
            });
        }));

    } catch(e) {
        return e;
    }

    return items;
};


module.exports = {
    handelSearch,
    handelDetail,
    handelOrder,
    handelDelivery,
    handelGenerateBill,
    handelPayment,
    handelCheckout,
    getActiveId
};