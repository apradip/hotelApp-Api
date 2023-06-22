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
      this.unitPrice = unitPrice;
      this.quantity = quantity;
      this.serviceChargePercentage = serviceChargePercentage;
      this.gstPercentage = gstPercentage;
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
        this.expenseAmount = expenseAmount,
        this.narration = "Expense for the miscellaneous items."
    };
};


// handel search guest
// url : hotel Id 
// query string : ?search= guest name, mobile, corporate name, corporate address
const handelSearch = async (req, res) => {
    const hotelId = req.params.hotelId;
    const search = req.query.search;

    let pipeline = [];
    let searchList = [];

    try {
        const filter1 = {
            $match: {
                hotelId: hotelId,
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
            $project: {
                roomsDetail: 0, tablesDetail: 0, servicesDetail: 0, expensesPaymentsDetail: 0,
                option: 0, isActive: 0, isEnable: 0
            }
        };

        if (!search) {
            pipeline = [filter1, filter3];
        } else {
            pipeline = [filter1, filter2, filter3];
        }

        const searchData = await Guest.aggregate(pipeline); 
        await Promise.all(searchData.map(async (item) => {
            const object = {
                id: item._id,
                name: item.name,
                mobile: item.mobile,
                guestCount: item.guestCount,
                corporateName: item.corporateName,
                corporateAddress: item.corporateAddress,
                gstNo: item.gstNo,
                inDate: item.inDate,
                inTime: item.inTime,
                totalBalance: item.balance,
                transactionId: await getActiveItem(item.miscellaneaDetail) 
            };
            
            searchList.push(object);
        }));
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(searchList);
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
        if (option === "N") {
            const filter1 = {
                $match: {
                    _id: mongoose.Types.ObjectId(guestId),         
                    hotelId: hotelId,
                    isActive: true,
                    isEnable: true
                }
            };
            const filter2 = {
                $unwind: "$miscellaneaDetail"
            };
            const filter3 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, tablesDetail: 0, servicesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0    
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

            pipeline = [filter1, filter2, filter3, filter4, filter5];

        } else if (option === "A") {
            
            const filter1 = {
                $match: {
                    _id: mongoose.Types.ObjectId(guestId),         
                    hotelId,
                    isEnable: true
                }
            };
            const filter2 = {
                $unwind: "$miscellaneaDetail"
            };
            const filter3 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, tablesDetail: 0, servicesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0
                }
            };
            const filter4 = { 
                $unwind: "$miscellaneaDetail.miscellanea"
            }; 

            pipeline = [filter1, filter2, filter3, filter4];
        } 

        const dbItems = await Guest.aggregate(pipeline);  
        
        await Promise.all(dbItems.map(async (detail) => {    
            const transactionId = detail.miscellaneaDetail._id;
            const item = detail.miscellaneaDetail.miscellanea;
            
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
                        _id: mongoose.Types.ObjectId(guestId),         
                        hotelId: hotelId,
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
                    $project: {
                        _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                        corporateName: 0, corporateAddress: 0, gstNo: 0,
                        roomsDetail: 0, tablesDetail: 0, servicesDetail: 0,
                        expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                        option: 0, isActive: 0, isEnable: 0, updatedDate: 0
                    }
                };
                
                const dbItems = await Guest.aggregate([filter1, filter2, filter3, filter4]);  
                
                if (dbItems) {
                    orderDb = dbItems[0].miscellaneaDetail.miscellanea;

                    await Promise.all(orders.map(async (order) => {    
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
            
                            if (master) {
                                orderDb.push(new miscellaneousType(
                                    master._id, 
                                    master.name, 
                                    master.price,
                                    order.quantity,
                                    hotel.serviceChargePercentage,
                                    hotel.foodGstPercentage
                                ));
                            }
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
            if (delivery) {
                // update all delivery date & time
                await Guest.updateOne(
                    {
                        _id: mongoose.Types.ObjectId(guestId), 
                        hotelId: hotelId,
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
                        hotelId: hotelId,
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
                const filter6 = {
                    $project: {
                        _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                        corporateName: 0, corporateAddress: 0, gstNo: 0, 
                        roomsDetail: 0, tablesDetail: 0, servicesDetail: 0,
                        expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                        option: 0, isActive: 0, isEnable: 0
                    }
                };
                
                const dbItems = await Guest.aggregate([filter1, filter2, filter3, filter4, filter5, filter6]);

                //append the current product to transaction document
                await Promise.all(dbItems.map(async (item) => {         
                    const currentItem = item.miscellaneaDetail.miscellanea;

                    if (currentItem) {
                        const data = new GuestMiscellaneousTransaction({
                            hotelId,
                            guestId,
                            id: currentItem.id,
                            name: currentItem.name,
                            serviceChargePercentage: currentItem.serviceChargePercentage,
                            serviceCharge: currentItem.serviceCharge,
                            gstPercentage: currentItem.gstPercentage,
                            gstCharge: currentItem.gstCharge,
                            unitPrice: currentItem.unitPrice,
                            quantity: currentItem.quantity,
                            totalPrice: currentItem.totalPrice,
                            orderDate: currentItem.orderDate,
                            orderTime: currentItem.orderTime,
                            despatchDate: currentItem.despatchDate,
                            despatchTime: currentItem.despatchTime
                        });
                
                        await data.save();
                    }
                }));   
            }
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

        const sums = await Guest.aggregate([filterSum1, filterSum2, filterSum3, filterSum4, filterSum5, filterSum6]);
        // End :: calculate miscellanea item price total


        // Start :: insert into expense if the transaction is not in guest 
        if (sums.length > 0) {
            total = sums[0].total;

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
                        hotelId: hotelId,
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
                hotelId: hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterBalance2 = {
            $unwind: "$expensesPaymentsDetail"
        };
        const filterBalance3 = {
            $group: {
                _id: "$tablesDetail._id",
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
                $inc: {
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
                _id: "$miscellaneaDetail._id",
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
                _id: mongoose.Types.ObjectId(guestId),
                hotelId: hotelId,
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
    // insert all add / modify operation items
    const transaction = new miscellaneousTransactionType([]);

    await Promise.all(orders.map(async (order) => {         
        // delete all remove / modify operation service    
        if ((order.operation) === "A") {
            
            // check for item existance
            const master = await Miscellaneous.findOne(
                {
                    _id: mongoose.Types.ObjectId(order.id), 
                    hotelId: hotel._id, 
                    isEnable: true
                }
            );    

            if (master) {
                transaction.miscellanea.push(new miscellaneousType(
                    master._id, 
                    master.name, 
                    master.price,
                    order.quantity,
                    hotel.serviceChargePercentage,
                    hotel.foodGstPercentage
                ));
            }
        }
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