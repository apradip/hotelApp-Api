const mongoose = require("mongoose");
const Hotel = require("./hotels");
const Guest = require("../models/guests");
const Miscellaneous = require("../models/miscellaneouses");
const GuestMiscellaneousTransaction = require("../models/guestMiscellaneousesTransaction");
const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
const GuestExpensePayment = require("../models/guestExpensesPaymentsTransaction");
const date = require("date-and-time");


class miscellaneousType {
    constructor(id, name, unitPrice, quantity, serviceChargePercentage, gstPercentage) {
      this.id = id;
      this.name = name;
      this.unitPrice = unitPrice.toFixed(0);
      this.quantity = quantity;
      this.serviceChargePercentage = serviceChargePercentage.toFixed(2);
      this.gstPercentage = gstPercentage.toFixed(2);
    };
};
class miscellaneousTransactionType {
    constructor(miscellanea) {
        this.miscellanea = miscellanea;
        this.isCheckedout = false;
    };
};
class expenseType {
    constructor(expenseId, billNo, expenseAmount) {
        this.billNo = billNo,
        this.type = "M",
        this.expenseId = expenseId,
        this.expenseAmount = expenseAmount.toFixed(0),
        this.narration = "Expense for the miscellaneous items."
    };
};
class guestType {
    constructor(id, name, mobile, guestCount, corporateName, corporateAddress, 
        gstNo, balance, inDate, inTime, option, transactionId = undefined, 
        items = []) {
        this.id = id,
        this.name = name,
        this.mobile = mobile,
        this.guestCount = guestCount,
        this.corporateName = corporateName,
        this.corporateAddress = corporateAddress,
        this.gstNo = gstNo,
        this.balance = balance,
        this.inDate = inDate,
        this.inTime = inTime,
        this.option = option,
        this.transactionId = transactionId,
        this.items = items
    };
}; 
class billType {
    constructor(expenseId = "", billId = "", miscellanea = [], expense, isPaid) {
        this.expenseId = expenseId,
        this.billId = billId,
        this.miscellanea = miscellanea, 
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

    let guestList = [];
    let pipeline = [];
    
    try {
        const filter1 = {
            $match: {
                hotelId,
                isActive: true,
                isEnable: true,
                outDate: {$exists:false},
                outTime: {$exists:false},
                $or: [{option: "R"}, {option: "M"}]
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
                inDate: 1, 
                inTime: 1, 
                name: 1
            }
        };
        
        if (!search) {
            pipeline = [filter1, filter3];
        } else {
            pipeline = [filter1, filter2, filter3];
        }

        const dbGuests = await Guest.aggregate(pipeline); 
        await Promise.all(dbGuests.map(async (guest) => {
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
                guest.inTime,
                guest.option
            ));
        }));
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(guestList);
};


// handel show all miscellanea items
// url : hotel Id / guest Id 
// query string : ?option = option: [non delivery / all]
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
            $unwind: "$miscellaneaDetail"
        };
        const filter3 = { 
            $match: {
                "miscellaneaDetail.isCheckedout": false
            }
        };
        const filter4 = { 
            $unwind: "$miscellaneaDetail.miscellanea"
        };
        const filter5 = {
            $match: {
                "miscellaneaDetail.miscellanea.despatchDate": {$exists: false},
                "miscellaneaDetail.miscellanes.despatchTime": {$exists: false}
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
                dbGuest[0].inTime,
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
            const item = dbItem.miscellaneaDetail.miscellanea;

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
                orderTime: item.orderTime,
                despatchDate: item.despatchDate,
                despatchTime: item.despatchTime,
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
                    $unwind: "$miscellaneaDetail"
                };
                const filter3 = {
                    $match: {
                        "miscellaneaDetail._id": mongoose.Types.ObjectId(transactionId)
                    }
                };
                
                const guests = await Guest.aggregate([filter1, filter2, filter3]);  
                if (!guests) return;
                dbOrder = guests[0].miscellaneaDetail.miscellanea;

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
                        const master = await Miscellaneous.findOne(
                            {
                                _id: mongoose.Types.ObjectId(order.id), 
                                hotelId, 
                                isEnable: true
                            }
                        );    
                        if (!master) return;

                        dbOrder.push(new miscellaneousType(
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
                            "miscellaneaDetail.$[ed].miscellanea": dbOrder
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
                        miscellaneaDetail: dbOrder
                    }
                }
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
                        "miscellaneaDetail.$[ele].miscellanea.$[sele].despatchDate": date.format(new Date(), "YYYY-MM-DD"), 
                        "miscellaneaDetail.$[ele].miscellanea.$[sele].despatchTime": date.format(new Date(), "HH:mm")
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
                $unwind: "$miscellaneaDetail"
            };
            const filter3 = {
                $match: {
                    "miscellaneaDetail._id": mongoose.Types.ObjectId(transactionId)
                }
            };
            const filter4 = { 
                $unwind: "$miscellaneaDetail.miscellanea" 
            };  
            const filter5 = {
                $match: {
                    "miscellaneaDetail.miscellanea._id": mongoose.Types.ObjectId(delivery.itemTransactionId),
                    "miscellaneaDetail.miscellanea.despatchDate": {$exists:true},
                    "miscellaneaDetail.miscellanea.despatchTime": {$exists:true}
                }
            };
                
            const dbItems = await Guest.aggregate([filter1, filter2, filter3, filter4, filter5]);

            //append the current product to transaction document
            await Promise.all(dbItems.map(async (guest) => {         
                const item = guest.miscellaneaDetail.miscellanea;
                if (!item) return;

                const data = new GuestMiscellaneousTransaction({
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
                    orderTime: item.orderTime,
                    despatchDate: item.despatchDate,
                    despatchTime: item.despatchTime
                });
            
                await data.save();
            }));   
        }));
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
};


// handle generate bill & display detail
// url : hotel Id / guest Id / transaction Id
const handelGenerateBill = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;
    
    let dbItemExpenseList = undefined;
    let total = 0;

    try {
        // Start :: calculate all despatched items price total
        const filterSum1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterSum2 = {
            $unwind: "$miscellaneaDetail"
        };
        const filterSum3 = {
            $match: {
                "miscellaneaDetail._id": mongoose.Types.ObjectId(transactionId)
            }
        };
        const filterSum4 = { 
            $unwind: "$miscellaneaDetail.miscellanea" 
        };  
        const filterSum5 = {
            $match: {
                "miscellaneaDetail.miscellanea.despatchDate": {$exists:true},
                "miscellaneaDetail.miscellanea.despatchTime": {$exists:true}
            }
        };
        const filterSum6 = {
            $group: {
                _id: "$miscellaneaDetail._id",
                total: {$sum: "$miscellaneaDetail.miscellanea.totalPrice"}
            }
        };

        const dbSum = await Guest.aggregate([filterSum1, filterSum2, filterSum3, filterSum4, filterSum5, filterSum6]);
        // End :: calculate all despatched items price total

        // Start :: insert/update expense if the transaction is not in guest 
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
                    type: "M",
                    expenseId: transactionId,
                    expenseAmount: total,
                    narration: "Expense for the miscellaneous items."
                });
        
                await expenseData.save();
                // End :: insert expense into expense transaction

                // set hotel last bill no
                await Hotel.setLastBillNo(hotelId, billNo);

            } else {
                // Start :: update expense transaction
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
                // End :: update expense transaction
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
                _id: "$expenseId._id",
                totalExpense: {$sum: "$expensesPaymentsDetail.expenseAmount"},
                totalPayment: {$sum: "$expensesPaymentsDetail.paymentAmount"}                        
            }
        };

        const dbBalance = await Guest.aggregate([filterBalance1, filterBalance2, filterBalance3]);
        if (!dbBalance) return;
        const balance = dbBalance[0].totalExpense + dbBalance[0].totalPayment;

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
        const filterItem1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterItem2 = {
            $unwind: "$miscellaneaDetail"
        };
        const filterItem3 = { 
            $unwind: "$miscellaneaDetail.miscellanea" 
        };  
        const filterItem4 = {
            $match: {
                "miscellaneaDetail._id": mongoose.Types.ObjectId(transactionId),
                "miscellaneaDetail.miscellanea.despatchDate": {$exists:true},
                "miscellaneaDetail.miscellanea.despatchTime": {$exists:true}
            }
        };
        const filterItem5 = {
            $group: {
                _id: "$miscellaneaDetail._id",
                miscellanea: {$push: "$miscellaneaDetail.miscellanea"},
            }
        };

        const dbItemList = await Guest.aggregate([filterItem1, filterItem2, filterItem3, filterItem4, filterItem5]);
        if (!dbItemList) res.status(500).send(e);
        if (dbItemList.length === 0) res.status(500).send(e);
        const expenseId = dbItemList[0]._id;
        const miscellanea = dbItemList[0].miscellanea;
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
                "expensesPaymentsDetail.type": "M"
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
            miscellanea,
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

    try {
        // update out date & time
        await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId),
                hotelId,
                option: "M",
                balance: 0,
                isActive: true,
                isEnable: true,

            },
            {
                $set: {
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


async function newItemValues(hotel, orders) {
    // insert all add items
    const transaction = new miscellaneousTransactionType([]);

    await Promise.all(orders.map(async (order) => {         
        if ((order.operation) !== "A") return;

        // check for item existance
        const master = await Miscellaneous.findOne(
            {
                _id: mongoose.Types.ObjectId(order.id), 
                hotelId: hotel._id, 
                isEnable: true
            }
        );    

        if (!master) return;
                
        transaction.miscellanea.push(
            new miscellaneousType(
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
            $unwind: "$miscellaneaDetail"
        };
        const filter3 = {
            $match: {
                "miscellaneaDetail.isCheckedout": false
            }
        };
        
        const guests = await Guest.aggregate([filter1, filter2, filter3]);
        if (!guests) return activeTransactionId; 
        if (guests.length === 0) return activeTransactionId;
        activeTransactionId = guests[0].miscellaneaDetail._id.toHexString();
    } catch(e) {
        return e;
    }

    return activeTransactionId;
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