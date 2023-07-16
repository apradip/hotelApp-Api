const mongoose = require("mongoose");
const Hotel = require("./hotels");
const Guest = require("../models/guests");
const Table = require("../models/tables");
const Food = require("../models/foods");
const GuestFoodTransaction = require("../models/guestFoodsTransaction");
const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
const date = require("date-and-time");

class tableType {
    constructor(id, no) {
      this.id = id;
      this.no = no;
    }
};

class foodType {
    constructor(id, name, unitPrice, quantity, serviceChargePercentage, gstPercentage) {
      this.id = id;
      this.name = name;
      this.unitPrice = unitPrice.toFixed(0);
      this.quantity = quantity;
      this.serviceChargePercentage = serviceChargePercentage;
      this.gstPercentage = gstPercentage;
    }
};

class foodTransactionType {
    constructor(tables, foods) {    
        this.tables = tables;
        this.foods = foods;
        this.isCheckedout = false;
    }
};

class expenseType {
    constructor(expenseId, billNo, expenseAmount) {
        this.billNo = billNo,
        this.type = "T",
        this.expenseId = expenseId,
        this.expenseAmount = expenseAmount.toFixed(0),
        this.narration = "Expense for the food items."
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
                option: "T"
                // $or: [{option: "R"}, {option: "T"}]
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
            let tables = "";

            if (guest.tablesDetail.length > 0) {
                if (!search) {
                    tables = guest.tablesDetail[guest.tablesDetail.length - 1].tables;
                } else {
                    guest.tablesDetail[guest.tablesDetail.length - 1].tables.map(async (table) => {
                        tables.length > 0 ?  tables = tables + ", " + table.no : tables = table.no;
                    });
                }
            }

            const object = {
                id: guest._id,
                name: guest.name,
                mobile: guest.mobile,
                guestCount: guest.guestCount,
                corporateName: guest.corporateName,
                corporateAddress: guest.corporateAddress,
                gstNo: guest.gstNo,
                tables: tables,
                inDate: guest.inDate,
                inTime: guest.inTime,
                totalBalance: guest.balance,
                option: guest.option,
                transactionId: guest.tablesDetail.length > 0 ? guest.tablesDetail[guest.tablesDetail.length - 1]._id : ""
            };
            
            itemList.push(object);
        }));
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(itemList);
};


// handel show all food items
// url : hotel Id / guest Id 
// query string : ?option: [non delivery / all]
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

        if (option === "N") {
            pipeline = [filter1, filter2, filter3, filter4];
        } else if (option === "A") {
            pipeline = [filter1, filter2, filter3];
        } 

        const guests = await Guest.aggregate(pipeline);

        await Promise.all(guests.map(async (guest) => {
            const transactionId = guest.tablesDetail._id;
            const item = guest.tablesDetail.foods;
            
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


// handel assign table
// url : hotel Id / guest Id
// body : {"tables": [{"id": "", "no": ""}]}
const handelAssignTable = async (req, res) => {
    const {hotelId, guestId} = req.params;
    const {tables} = req.body;

    try {
        if (!tables) return;
        const transactions = new foodTransactionType([], []);

        await Promise.all(tables.map(async (table) => {
            // check if the table is empty
            const filter = {
                hotelId, 
                _id: mongoose.Types.ObjectId(table.id), 
                isOccupied: false, 
                isEnable: true
            };
            const foundTable = await Table.findOne(filter);

            if (foundTable) {
                transactions.tables.push(new tableType(
                    foundTable._id, 
                    foundTable.no
                ));
            }

            const update = {
                guestId: guestId, 
                isOccupied: true
            };
            // const resTableUpdate = await Table.updateOne(filter, update);
            // if (!resTableUpdate) return res.status(404).send()
        }));

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
            $match: {
                "tablesDetail.isCheckedout": false
            }
        };
        
        const guests = await Guest.aggregate([filter1, filter2, filter3]);

        if (guests.length > 0) {
            const itemTransactionId = guests[0].tablesDetail._id;

            await Guest.updateOne(
                {
                    hotelId,
                    _id: mongoose.Types.ObjectId(guestId), 
                    isActive: true,
                    isEnable: true
                },
                {
                    $set: {
                        "tablesDetail.$[ele].tables": transactions.tables
                    }
                },
                { 
                    arrayFilters: [ 
                        {"ele._id": mongoose.Types.ObjectId(itemTransactionId)},
                    ]           
                }
            );

        } else {
            //add new
            const filterGuest = {_id: guestId};
            const updateGuest = {$push: {tablesDetail: transactions}};
            const resGuestUpdate = await Guest.updateOne(filterGuest, updateGuest);
        }
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
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
                $unwind: "$tablesDetail"
            };
            const filter3 = {
                $match: {
                    "tablesDetail._id": mongoose.Types.ObjectId(transactionId)
                }
            };

            const guests = await Guest.aggregate([filter1, filter2, filter3]);  

            if (!guests) return;

            orderDb = guests[0].tablesDetail.foods;

            await Promise.all(orders.map(async (order, idx) => {
                if (order.quantity <= 0) {
                    orders[idx].operation = "R";
                }   

                if (((order.operation) === "M") || ((order.operation) === "R")) {
                    const keyToFind = "id";
                    const valueToFind = order.id;
                    orderDb = orderDb.filter(object => object[keyToFind] !== valueToFind);
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
    
                    if (!master) return;

                    orderDb.push(new foodType(
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
                        "tablesDetail.$[ed].foods": orderDb
                    }
                },
                { 
                    arrayFilters: [{
                        "ed._id": mongoose.Types.ObjectId(transactionId)
                    }]           
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
                    $unwind: "$tablesDetail"
                };
                const filter3 = {
                    $match: {
                        "tablesDetail._id": mongoose.Types.ObjectId(transactionId)
                    }
                };
                const filter4 = { 
                    $unwind: "$tablesDetail.foods" 
                };  
                const filter5 = {
                    $match: {
                        "tablesDetail.foods._id": mongoose.Types.ObjectId(delivery.itemTransactionId),
                        "tablesDetail.foods.despatchDate": {$exists:true},
                        "tablesDetail.foods.despatchTime": {$exists:true}
                    }
                };
                
                const guests = await Guest.aggregate([filter1, filter2, filter3, filter4, filter5]);
       
                //append the current product to transaction document
                await Promise.all(guests.map(async (guest) => {
                    const item = guest.tablesDetail.foods;

                    if (!item) return;
                    const data = new GuestFoodTransaction({
                        hotelId,
                        guestId,
                        foodId: item.id,
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
        // Start :: calculate food total
        const filterSum1 = {
            $match: {
                hotelId,
                _id: mongoose.Types.ObjectId(guestId),         
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
            $match: {
                "tablesDetail.foods.despatchDate": {$exists:true},
                "tablesDetail.foods.despatchTime": {$exists:true}
            }
        };
        const filterSum6 = {
            $group: {
                _id: "$tablesDetail._id",
                total: {$sum: "$tablesDetail.foods.totalPrice"}
            }
        };

        const despatchSum = await Guest.aggregate([filterSum1, filterSum2, filterSum3, filterSum4, filterSum5, filterSum6]);
        // End :: calculate food total

        // Start :: insert into expense if the transaction is not in guest 
        if (despatchSum) {
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
                _id: "$expensesPaymentsDetail._id",
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
            $unwind: "$tablesDetail.foods" 
        };  
        const filterBill4 = {
            $unwind: "$expensesPaymentsDetail"
        };
        const filterBill5 = {
            $match: {
                "tablesDetail._id": mongoose.Types.ObjectId(transactionId),
                "expensesPaymentsDetail.expenseId": transactionId,
                "tablesDetail.foods.despatchDate": {$exists:true},
                "tablesDetail.foods.despatchTime": {$exists:true}
            }
        };
        const filterBill6 = {
            $group: {
                _id: "$tablesDetail._id",
                foods: {$push: "$tablesDetail.foods"},
                expensesPaymentsDetail: {$push: "$expensesPaymentsDetail"}
            }
        };
    
        const bills = await Guest.aggregate([filterBill1, filterBill2, filterBill3, filterBill4, filterBill5, filterBill6]);  
    
        return res.status(200).send(bills);
        // End :: get all food items 
    } catch(e) {
        return res.status(500).send(e);
    }

    // return res.status(500).send();
};


// handle guest checkout 
// url : hotel Id / guest Id / transaction Id
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
            await Promise.all(item.tablesDetail.map(async (tableDetail) => {
                await Promise.all(tableDetail.tables.map(async (table) => {
                    await Table.findByIdAndUpdate(
                                    mongoose.Types.ObjectId(table.id), 
                                    {$set: {isOccupied: false, guestId: ""}});  
                }));
            }));
        }));
    
        // update out date & time
        await Guest.updateOne(
            {
                hotelId,
                _id: mongoose.Types.ObjectId(guestId),
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


async function getActiveTables(hotelId, guestId) {
    let tables = "";
    
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
            $unwind: "$tablesDetail"
        };
        const filter3 = {
            $match: {
                "tablesDetail.isCheckedout": false
            }
        };
        
        const guests = await Guest.aggregate([filter1, filter2, filter3]);

        if (!guests) return; 
        tables = guests[0].tablesDetail.tables;
        // await Promise.all(guests[0].tablesDetail.tables.map(async (table) => {  
        //     tables.length > 0 ?  tables = tables + ", " + table.no : tables = table.no;       
        // }));
    } catch(e) {
        return e;
    }

    return tables;
};



module.exports = {
    handelSearch,
    handelDetail,
    handelOrder,
    handelAssignTable,
    handelDelivery,
    handelGenerateBill,
    handelCheckout,
    getActiveTables
};