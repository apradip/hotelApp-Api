const mongoose = require("mongoose");
const Hotel = require("./hotels");
const Guest = require("../models/guests");
const Table = require("../models/tables");
const Food = require("../models/foods");
const GuestFoodTransaction = require("../models/guestFoodsTransaction");
const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
const date = require("date-and-time");

class foodType {
    constructor(id, name, unitPrice, quantity, serviceChargePercentage, gstPercentage) {
      this.id = id;
      this.name = name;
      this.unitPrice = unitPrice;
      this.quantity = quantity;
      this.serviceChargePercentage = serviceChargePercentage;
      this.gstPercentage = gstPercentage;
    }
};

class expenseType {
    constructor(expenseId, billNo, expenseAmount) {
        this.billNo = billNo,
        this.type = "T",
        this.expenseId = expenseId,
        this.expenseAmount = expenseAmount,
        this.narration = "Expense for the food items."
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
                $or: [{option: "R"}, {option: "T"}]
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
                roomsDetail: 0, servicesDetail: 0, miscellaneousesDetail: 0, expensesPaymentsDetail: 0,
                option: 0, isActive: 0, isEnable: 0
            }
        };

        if (!search) {
            pipeline = [filter1, filter3];
        } else {
            pipeline = [filter1, filter2, filter3];
        }

        const searchData = await Guest.aggregate(pipeline); 

        await Promise.all(searchData.map(async (element) => {
            let tables = "";

            if (!search) {
                tables = element.tablesDetail[element.tablesDetail.length - 1].tables;
            } else {
                element.tablesDetail[element.tablesDetail.length - 1].tables.map(async (table) => {
                    tables.length > 0 ?  tables = tables + ", " + table.no : tables = table.no;
                });
            }

            const object = {
                id: element._id,
                name: element.name,
                mobile: element.mobile,
                guestCount: element.guestCount,
                corporateName: element.corporateName,
                corporateAddress: element.corporateAddress,
                gstNo: element.gstNo,
                tables: tables,
                inDate: element.inDate,
                inTime: element.inTime,
                totalBalance: element.balance,
                transactionId: element.tablesDetail[element.tablesDetail.length - 1]._id            
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
        if (option === "N") {
            const filter1 = {
                $match: {
                    hotelId,
                    _id: mongoose.Types.ObjectId(guestId),         
                    isActive: true,
                    isEnable: true
                }
            };
            const filter2 = {
                $unwind: "$tablesDetail"
            };
            const filter3 = { 
                $unwind: "$tablesDetail.foods"
            };
            const filter4 = {
                $match: {
                    "tablesDetail.foods.despatchDate": {$exists: false},
                    "tablesDetail.foods.despatchTime": {$exists: false}
                }
            };
            const filter5 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, servicesDetail: 0, miscellaneaDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0    
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
                $unwind: "$tablesDetail"
            };
            const filter3 = { 
                $unwind: "$tablesDetail.foods"
            }; 
            const filter4 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, servicesDetail: 0, miscellaneaDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0
                }
            };

            pipeline = [filter1, filter2, filter3, filter4];
        } 

        const dbItems = await Guest.aggregate(pipeline);

        await Promise.all(dbItems.map(async (detail) => {
            const transactionId = detail.tablesDetail._id;
            const item = detail.tablesDetail.foods;
            
            const dataOrder = {
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

            itemList.push(dataOrder);
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
                $unwind: "$tablesDetail"
            };
            const filter3 = {
                $match: {
                    "tablesDetail._id": mongoose.Types.ObjectId(transactionId)
                }
            };
            const filter4 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, miscellaneaDetail: 0, servicesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0, updatedDate: 0
                }
            };

            const dbItems = await Guest.aggregate([filter1, filter2, filter3, filter4]);  

            if (dbItems) {
                orderDb = dbItems[0].tablesDetail.foods;

                await Promise.all(orders.map(async (order) => {
                    if (order) {
                        if (((order.operation) === "M") || ((order.operation) === "R")) {
                            const keyToFind = "id";
                            const valueToFind = order.id;
                            orderDb = orderDb.filter(object => object[keyToFind] !== valueToFind);
                        }
                    }
                }));

                await Promise.all(orders.map(async (order) => {
                    if (((order.operation) === "A") || ((order.operation) === "M")) {
                        // check for item existance
                        const master = await Food.findOne(
                            {
                                hotelId, 
                                _id: mongoose.Types.ObjectId(order.id), 
                                isEnable: true
                            }
                        );    
        
                        if (master) {
                            orderDb.push(new foodType(
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
                            "tablesDetail.$[ed].foods": orderDb
                        }
                    },
                    { 
                        arrayFilters: [{
                            "ed._id": mongoose.Types.ObjectId(transactionId)
                        }]           
                    }
                );  
            } else {
                return res.status(500).send();
            }
        }
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
};


// handel delivery
//query string : hotel Id / guest Id / transaction Id
const handelDelivery = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;
    const {deliveries} = req.body;

    try {
        await Promise.all(deliveries.map(async (delivery) => {
            if (delivery) {
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
                            "tablesDetail.$[ele].foods.$[fele].despatchDate": date.format(new Date(), "YYYY-MM-DD"), 
                            "tablesDetail.$[ele].foods.$[fele].despatchTime": date.format(new Date(), "HH:mm")
                        }
                    },
                    { 
                        arrayFilters: [ 
                            {"ele._id": mongoose.Types.ObjectId(transactionId)},
                            {"fele._id": mongoose.Types.ObjectId(delivery.itemTransactionId)}
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
                    $project: {
                        _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                        corporateName: 0, corporateAddress: 0, gstNo: 0, 
                        roomsDetail: 0, servicesDetail: 0, miscellaneaDetail: 0,
                        expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                        option: 0, isActive: 0, isEnable: 0, "tablesDetail.tables": 0
                    }
                };
                const filter3 = {
                    $unwind: "$tablesDetail"
                };
                const filter4 = {
                    $match: {
                        "tablesDetail._id": mongoose.Types.ObjectId(transactionId)
                    }
                };
                const filter5 = { 
                    $unwind: "$tablesDetail.foods" 
                };  
                const filter6 = {
                    $match: {
                        "tablesDetail.foods._id": mongoose.Types.ObjectId(delivery.itemTransactionId)
                    }
                };
                
                const dbItems = await Guest.aggregate([filter1, filter2, filter3, filter4, filter5, filter6]);
       
                //append the current product to transaction document
                await Promise.all(dbItems.map(async (item) => {
                    const currentItem = item.tablesDetail.foods;

                    if (currentItem) {
                        const data = new GuestFoodTransaction({
                            hotelId,
                            guestId,
                            foodId: currentItem.id,
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
                                hotelId,
                                _id: mongoose.Types.ObjectId(guestId), 
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
};


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
                hotelId: hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterSum2 = {
            $unwind: "$tablesDetail"
        };
        const filterSum3 = {
            $match: {
                "tablesDetail._id": mongoose.Types.ObjectId(transactionId)
            }
        };
        const filterSum4 = { 
            $unwind: "$tablesDetail.foods" 
        };  
        const filterSum5 = {
            $group: {
                _id: "$tablesDetail._id",
                total: {$sum: "$tablesDetail.foods.totalPrice"}
            }
        };

        const sums = await Guest.aggregate([filterSum1, filterSum2, filterSum3, filterSum4, filterSum5]);
        // End :: calculate food total

        // Start :: insert into expense if the transaction is not in guest 
        if (sums) {
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
                    type: "T",
                    expenseId: transactionId,
                    expenseAmount: total,
                    narration: "Expense for the food items."
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

            // Start :: get all food items 
            const filterBill1 = {
                $match: {
                    hotelId,
                    _id: mongoose.Types.ObjectId(guestId),         
                    isActive: true,
                    isEnable: true
                }
            };
            const filterBill2 = {
                $unwind: "$tablesDetail"
            };
            const filterBill3 = {
                $unwind: "$expensesPaymentsDetail"
            };
            const filterBill4 = {
                $match: {
                    "tablesDetail._id": mongoose.Types.ObjectId(transactionId),
                    "expensesPaymentsDetail.expenseId": transactionId
                }
            };
            const filterBill5 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0, 
                    roomsDetail: 0, servicesDetail: 0, miscellaneaDetail: 0,
                    balance: 0, inDate: 0, inTime: 0, option: 0, isActive: 0, 
                    isEnable: 0, __v: 0,
                    "tablesDetail.isCheckedout": 0, "tablesDetail._id": 0
                }
            };
    
            const bills = await Guest.aggregate([filterBill1, filterBill2, filterBill3, filterBill4, filterBill5]);  
        
            return res.status(200).send(bills);
            // End :: get all food items 
        }
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(500).send();
};


// handle guest checkout 
//query string : hotel Id / guest Id / transaction Id
const handelCheckout = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;

    try {
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
                tablesDetail: {
                    $slice: ["$tablesDetail", -1] 
                }
            }
        };

        const foundTableDetails = await Guest.aggregate([filter1, filter2]);  

        //update all tables guestid it null & occupied status is false
        await Promise.all(foundTableDetails.map(async (item) => {
            item.tablesDetail.forEach(async (tableDetail) => {
                tableDetail.tables.forEach(async (table) => {
                    await Table.findByIdAndUpdate(
                                    mongoose.Types.ObjectId(table.id), 
                                    {$set: {isOccupied: false, guestId: ""}});  
                });
            });
        }));
    
        // update out date & time
        await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId),
                hotelId: hotelId,
                isActive: true,
                isEnable: true,
                tablesDetail: {
                    $elemMatch: {
                        _id: mongoose.Types.ObjectId(transactionId)
                    }
                }
            },
            {
                $set: {
                    "tablesDetail.$.isCheckedout": true,
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



module.exports = {
    handelSearch,
    handelDetail,
    handelOrder,
    handelDelivery,
    handelGenerateBill,
    handelCheckout
};