const mongoose = require("mongoose");
const Hotel = require("./hotels");
const Guest = require("../models/guests");
const Miscellaneous = require("../models/miscellaneouses");
const GuestMiscellaneousTransaction = require("../models/guestMiscellaneousesTransaction");
const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
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


// handel search guest
// url : hotel Id 
// query string : ?search= guest name, mobile, corporate name, corporate address
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

        if (!search) {
            pipeline = [filter1];
        } else {
            pipeline = [filter1, filter2];
        }

        const guests = await Guest.aggregate(pipeline); 
        await Promise.all(guests.map(async (guest) => {
            const object = {
                id: guest._id,
                name: guest.name,
                mobile: guest.mobile,
                guestCount: guest.guestCount,
                corporateName: guest.corporateName,
                corporateAddress: guest.corporateAddress,
                gstNo: guest.gstNo,
                inDate: guest.inDate,
                inTime: guest.inTime,
                totalBalance: guest.balance,
                transactionId: await getActiveItem(guest.miscellaneaDetail) 
            };
            
            itemList.push(object);
        }));
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(itemList);
};


// handel show all miscellanea items
// url : hotel Id / guest Id 
// query string : ?option = option: [non delivery / all]
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
            $unwind: "$miscellaneaDetail"
        };
        const filter3 = { 
            $unwind: "$miscellaneaDetail.miscellanea"
        };
        const filter4 = {
            $match: {
                "miscellaneaDetail.miscellanea.despatchDate": {$exists: false},
                "miscellaneaDetail.miscellanes.despatchTime": {$exists: false}
            }
        };

        if (option === "N") {
            pipeline = [filter1, filter2, filter3, filter4];
        } else if (option === "A") {
            pipeline = [filter1, filter2, filter3];
        } 

        const guests = await Guest.aggregate(pipeline);  
        
        await Promise.all(guests.map(async (guest) => {    
            const transactionId = guest.miscellaneaDetail._id;
            const item = guest.miscellaneaDetail.miscellanea;
            
            const object = {
                transactionId: transactionId,
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
                despatchTime: item.despatchTime
            };

            itemList.push(object);
        }));
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(itemList);
};


// handel order
// url : hotel Id / guest Id / transaction Id
// body : {"orders": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;
    const {orders} = req.body;

    let orderDb = undefined;

    try {
        // get hotel tax details    
        const hotel = await Hotel.detail(hotelId);

        if (transactionId !== "undefined") {
            if (transactionId) {
                const filter1 = {
                    $match: {
                        hotelId,
                        _id: mongoose.Types.ObjectId(guestId),         
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
                orderDb = guests[0].miscellaneaDetail.miscellanea;

                await Promise.all(orders.map(async (order, idx) => {   
                    if (order.quantity <= 0) {
                        orders[idx].operation = "R";
                    }   

                    if (((order.operation) === "M") || ((order.operation) === "R")) {
                        const keyToFind = "id";
                        const valueToFind = order.id;
                        orderDb = orderDb.filter(obj => obj[keyToFind] !== valueToFind);
                    }
                }));

                await Promise.all(orders.map(async (order) => {    
                    if (((order.operation) === "A") || ((order.operation) === "M")) {
                        
                        // check for item existance
                        const master = await Miscellaneous.findOne(
                            {
                                hotelId, 
                                _id: mongoose.Types.ObjectId(order.id), 
                                isEnable: true
                            }
                        );    
        
                        if (!master) return;

                        orderDb.push(new miscellaneousType(
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
                        hotelId,
                        _id: mongoose.Types.ObjectId(guestId), 
                        isActive: true,
                        isEnable: true
                    },
                    {
                        $set: {
                            "miscellaneaDetail.$[ed].miscellanea": orderDb
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
            orderDb = await newItemValues(hotel, orders);

            await Guest.updateOne(
                {
                    hotelId,
                    _id: mongoose.Types.ObjectId(guestId), 
                    isActive: true,
                    isEnable: true
                },
                {
                    $push: {
                        miscellaneaDetail: orderDb
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

    try {
        await Promise.all(deliveries.map(async (delivery) => {         
            if (!delivery) return;

            // update all delivery date & time
            await Guest.updateOne(
                {
                    hotelId,
                    _id: mongoose.Types.ObjectId(guestId), 
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
                    hotelId,
                    _id: mongoose.Types.ObjectId(guestId),         
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
                
            const guests = await Guest.aggregate([filter1, filter2, filter3, filter4, filter5]);

            //append the current product to transaction document
            await Promise.all(guests.map(async (guest) => {         
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

        const despatchSum = await Guest.aggregate([filterSum1, filterSum2, filterSum3, filterSum4, filterSum5, filterSum6]);
        // End :: calculate all despatched items price total

        // Start :: insert/update expense if the transaction is not in guest 
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
                    type: "M",
                    expenseId: transactionId,
                    expenseAmount: total,
                    narration: "Expense for the miscellaneous items."
                });
        
                await data.save();
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
                _id: "$expenseId._id",
                totalExpense: {$sum: "$expensesPaymentsDetail.expenseAmount"},
                totalPayment: {$sum: "$expensesPaymentsDetail.paymentAmount"}                        
            }
        };

        const balances = await Guest.aggregate([filterBalance1, filterBalance2, filterBalance3]);
        if (!balances) return;

        const balance = balances[0].totalExpense + balances[0].totalPayment;

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
                hotelId,
                _id: mongoose.Types.ObjectId(guestId),         
                isActive: true,
                isEnable: true
            }
        };
        const filterBill2 = {
            $unwind: "$miscellaneaDetail"
        };
        const filterBill3 = { 
            $unwind: "$miscellaneaDetail.miscellanea" 
        };  
        const filterBill4 = {
            $unwind: "$expensesPaymentsDetail"
        };
        const filterBill5 = {
            $match: {
                "miscellaneaDetail._id": mongoose.Types.ObjectId(transactionId),
                "expensesPaymentsDetail.expenseId": transactionId,
                "miscellaneaDetail.miscellanea.despatchDate": {$exists:true},
                "miscellaneaDetail.miscellanea.despatchTime": {$exists:true}
            }
        };
        const filterBill6 = {
            $group: {
                _id: "$expensesPaymentsDetail._id",
                miscellanea: {$push: "$miscellaneaDetail.miscellanea"},
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
                miscellaneaDetail: {
                    $elemMatch: {
                        _id: mongoose.Types.ObjectId(transactionId)
                    }
                }
            },
            {
                $set: {
                    "miscellaneaDetail.$.isCheckedout": true,
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
                
        transaction.miscellanea.push(new miscellaneousType(
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

async function getActiveItem(detail) {
    let transactionId = "undefined";

     await Promise.all(detail.map(async (item) => {         
        if ((!item.isCheckedout) && (transactionId === "undefined")) {
            transactionId = item._id.toHexString();
        }
    }));

    return transactionId;
}


module.exports = {
    handelSearch,
    handelDetail,
    handelOrder,
    handelDelivery,
    handelGenerateBill,
    handelCheckout
};