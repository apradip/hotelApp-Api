const mongoose = require("mongoose");
const Hotel = require("./hotels");
const Guest = require("../models/guests");
const Services = require("../models/services");
const GuestServiceTransaction = require("../models/guestServicesTransaction");
const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
const date = require("date-and-time");

class serviceType {
    constructor(id, name, unitPrice, quantity, serviceChargePercentage, gstPercentage) {
      this.id = id;
      this.name = name;
      this.unitPrice = unitPrice;
      this.quantity = quantity;
      this.serviceChargePercentage = serviceChargePercentage;
      this.gstPercentage = gstPercentage;
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
        this.expenseAmount = expenseAmount,
        this.narration = "Expense for the service items."
    };
};


//handel search guest
//query string : hotel Id?search= guest name, mobile, corporate name, corporate address
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
                $or: [{option: "R"}, {option: "S"}]
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
                roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0, expensesPaymentsDetail: 0,
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
                transactionId: await getActiveItem(item.servicesDetail) 
            };
            
            searchList.push(object);
        }));
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(searchList);
};


// handel show all orders
//query string : hotel Id / guest Id 
//query string : option = option: [non delivery / all]
const handelDetail = async (req, res) => {
    const {hotelId, guestId} = req.params;
    const option = req.query.option;

    let itemList = [];
    let pipeline = [];

    try {
        let dbItems = null;

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
                $unwind: "$servicesDetail"
            };
            const filter3 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0    
                }
            };
            const filter4 = { 
                $unwind: "$servicesDetail.services"
            };
            const filter5 = {
                $match: {
                    "servicesDetail.services.despatchDate": {$exists: false},
                    "servicesDetail.services.despatchTime": {$exists: false}
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
                $unwind: "$servicesDetail"
            };
            const filter3 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0
                }
            };
            const filter4 = { 
                $unwind: "$servicesDetail.services"
            }; 

            pipeline = [filter1, filter2, filter3, filter4];
        } 

        dbItems = await Guest.aggregate(pipeline);

        await Promise.all(dbItems.map(async (detail) => {    
            const transactionId = detail.servicesDetail._id;
            const item = detail.servicesDetail.services;
            
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
//query string : hotel Id / guest Id / transaction Id
//body : {"orders": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
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
                    $unwind: "$servicesDetail"
                };
                const filter3 = {
                    $match: {
                        "servicesDetail._id": mongoose.Types.ObjectId(transactionId)
                    }
                };
                const filter4 = {
                    $project: {
                        _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                        corporateName: 0, corporateAddress: 0, gstNo: 0,
                        roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                        expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                        option: 0, isActive: 0, isEnable: 0, updatedDate: 0
                    }
                };

                const dbItems = await Guest.aggregate([filter1, filter2, filter3, filter4]);  
                
                if (dbItems) {
                    orderDb = dbItems[0].servicesDetail.services;

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
                            const master = await Services.findOne(
                                {
                                    hotelId, 
                                    _id: mongoose.Types.ObjectId(order.id), 
                                    isEnable: true
                                }
                            );    
            
                            if (master) {
                                orderDb.push(new serviceType(
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
                                "servicesDetail.$[ed].services": orderDb
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
                        servicesDetail: orderDb
                    }
                },
            );  
        }

        return res.status(200).send();
    } catch(e) {
        return res.status(500).send(e);
    }
}

async function newItemValues(hotel, orders) {
    // insert all add / modify operation items
    const transaction = new serviceTransactionType([]);

    await Promise.all(orders.map(async (order) => {         
        // delete all remove / modify operation service    
        if ((order.operation) === "A") {
            
            // check for item existance
            const master = await Services.findOne(
                {
                    _id: mongoose.Types.ObjectId(order.id), 
                    hotelId: hotel._id, 
                    isEnable: true
                }
            );    

            if (master) {
                transaction.services.push(new serviceType(
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
}


// handel delivery
//query string : hotel Id / guest Id / transaction Id
//body : {"deliveries": [{"id": ""}]}
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
                            "servicesDetail.$[ele].services.$[sele].despatchDate": date.format(new Date(), "YYYY-MM-DD"), 
                            "servicesDetail.$[ele].services.$[sele].despatchTime": date.format(new Date(), "HH:mm")
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
                        "servicesDetail.services._id": mongoose.Types.ObjectId(delivery.itemTransactionId)
                    }
                };
                const filter6 = {
                    $project: {
                        _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                        corporateName: 0, corporateAddress: 0, gstNo: 0, 
                        roomsDetail: 0, tablesDetail: 0, miscellaneaDetail: 0,
                        expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                        option: 0, isActive: 0, isEnable: 0
                    }
                };
                
                const dbItems = await Guest.aggregate([filter1, filter2, filter3, filter4, filter5, filter6]);

                //append the current product to transaction document
                await Promise.all(dbItems.map(async (item) => {         
                    const currentItem = item.servicesDetail.services;

                    if (currentItem) {
                        const data = new GuestServiceTransaction({
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

                        //update banalce
                        //increase balance with product total
                        await Guest.updateOne(
                            {
                                _id: mongoose.Types.ObjectId(guestId), 
                                hotelId: hotelId,
                                isActive: true,
                                isEnable: true
                            },
                            {
                                $inc: {
                                    balance: (currentItem.totalPrice.toFixed(0) * -1)
                                }
                            }
                        );  
                    }
                }));   
            }
        }));
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
}


// handle guest bill summery
//query string : hotel Id / guest Id / transaction Id
const handelGenerateBill = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;
   
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
            $group: {
                _id: "$servicesDetail._id",
                total: {$sum: "$servicesDetail.services.totalPrice"}
            }
        };

        const sums = await Guest.aggregate([filterSum1, filterSum2, filterSum3, filterSum4, filterSum5]);
        // End :: calculate food total

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
                    type: "S",
                    expenseId: transactionId,
                    expenseAmount: total,
                    narration: "Expense for the service items."
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


        // calculate and update food total
        const filterBill1 = {
            $match: {
                hotelId,
                _id: mongoose.Types.ObjectId(guestId),         
                isActive: true,
                isEnable: true
            }
        };
        const filterBill2 = {
            $unwind: "$servicesDetail"
        };
        const filterBill3 = {
            $unwind: "$expensesPaymentsDetail"
        };
        const filterBill4 = {
            $match: {
                "servicesDetail._id": mongoose.Types.ObjectId(transactionId),
                "expensesPaymentsDetail.expenseId": transactionId
            }
        };
        const filterBill5 = {
            $project: {
                _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                corporateName: 0, corporateAddress: 0, gstNo: 0, 
                roomsDetail: 0, tablesDetail: 0, miscellaneaDetail: 0,
                balance: 0, inDate: 0, inTime: 0, option: 0, isActive: 0, 
                isEnable: 0, __v: 0,
                "servicesDetail.isCheckedout": 0, "servicesDetail._id": 0, 
            }
        };

        const bills = await Guest.aggregate([filterBill1, filterBill2, filterBill3, filterBill4, filterBill5]);

        return res.status(200).send(bills);        
    } catch(e) {
        return res.status(500).send(e);
    }
};


// handle guest checkout 
//query string : hotel Id / guest Id / transaction Id
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
                servicesDetail: {
                    $elemMatch: {
                        _id: mongoose.Types.ObjectId(transactionId)
                    }
                }
            },
            {
                $set: {
                    "servicesDetail.$.isCheckedout": true,
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
    // handelBillDetail,
    handelCheckout
}