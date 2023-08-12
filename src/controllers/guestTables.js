const mongoose = require("mongoose");
const Hotel = require("./hotels");
const Guest = require("../models/guests");
const Table = require("../models/tables");
const Food = require("../models/foods");
const GuestFoodTransaction = require("../models/guestFoodsTransaction");
const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
const GuestExpensePayment = require("../models/guestExpensesPaymentsTransaction");
const date = require("date-and-time");

const GuestRoom = require("./guestRooms");

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
class guestType {
    constructor(id, name, mobile, guestCount, corporateName, corporateAddress, 
        gstNo, balance, inDate, inTime, option, transactionId = undefined, 
        tables = [],
        items = [],
        rooms = []) {
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
        this.tables = tables,
        this.items = items,
        this.rooms = rooms
    };
}; 
class billType {
    constructor(expenseId = "", billId = "", foods = [], expense, isPaid) {
        this.expenseId = expenseId,
        this.billId = billId,
        this.foods = foods, 
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
    const roomOnly = req.query.roomonly;

    let guestList = [];
    let pipeline = [];
    
    try {
        let filter1 = "";

        if (roomOnly === "true") {
            filter1 = {
                $match: {
                    hotelId,
                    isActive: true,
                    isEnable: true,
                    outDate: {$exists:false},
                    outTime: {$exists:false},
                    option: "R"
                }};
        } else {
            filter1 = {
                $match: {
                    hotelId,
                    isActive: true,
                    isEnable: true,
                    outDate: {$exists:false},
                    outTime: {$exists:false},
                    $or: [{option: "R"}, {option: "T"}]
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
                inTime: 1, 
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
                    guest.inDate,
                    guest.inTime,
                    guest.option,
                    undefined,
                    [],
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
                    guest.inTime,
                    guest.option,
                    undefined,
                    await getActiveTables(hotelId, guest._id),
                    await getPendingOrderItems(hotelId, guest._id)
                ));
            }
        }));
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(guestList);
};


// handel show all food items
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
            $unwind: "$tablesDetail"
        };
        const filter3 = { 
            $match: {
                "tablesDetail.isCheckedout": false
            }
        };
        const filter4 = { 
            $unwind: "$tablesDetail.foods"
        };
        const filter5 = {
            $match: {
                "tablesDetail.foods.despatchDate": {$exists: false},
                "tablesDetail.foods.despatchTime": {$exists: false}
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
        guest.tables = await getActiveTables(hotelId, guestId);

        if (option === "GA")
            pipeline = [filter1, filter2, filter4];
        else if (option === "A") 
            pipeline = [filter1, filter2, filter3, filter4];
        else if (option === "N") 
            pipeline = [filter1, filter2, filter3, filter4, filter5];
        
        const dbItems = await Guest.aggregate(pipeline);  
        await Promise.all(dbItems.map(async (dbItem) => {    
            const item = dbItem.tablesDetail.foods;
            
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


// handel assign table
// url : hotel Id / guest Id
// body : {"tables": [{"id": "", "no": ""}]}
const handelAssignTable = async (req, res) => {
    const {hotelId, guestId} = req.params;
    const {tables, guestCount} = req.body;

    try {
        if (!tables) return res.status(500).send();
        const transactions = new foodTransactionType([], []);

        await Promise.all(tables.map(async (table) => {
            // check if the table is empty
            const filter = {
                _id: mongoose.Types.ObjectId(table.id), 
                hotelId, 
                // isOccupied: false, 
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
                guestCount: guestCount, 
                isOccupied: true
            };

            const resTableUpdate = await Table.updateOne(filter, update);
            if (!resTableUpdate) return res.status(404).send()
        }));

        const filter1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
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
                    _id: mongoose.Types.ObjectId(guestId), 
                    hotelId,
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
                        {"ele._id": mongoose.Types.ObjectId(itemTransactionId)}
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

    let activeTransactionId = undefined;
    let dbOrder = undefined;

    try {
        // get hotel tax details    
        const hotel = await Hotel.detail(hotelId);

        if (transactionId === "undefined") {
            activeTransactionId = await getActiveId(hotelId, guestId);
        } else {
            activeTransactionId = transactionId;
        }

        // if (transactionId !== "undefined") {
            // if (!transactionId) return;

            if (activeTransactionId) {
                const filter1 = {
                    $match: {
                        _id: mongoose.Types.ObjectId(guestId),         
                        hotelId,
                        isActive: true,
                        isEnable: true
                    }
                };
                const filter2 = {
                    $unwind: "$tablesDetail"
                };
                const filter3 = {
                    $match: {
                        "tablesDetail._id": mongoose.Types.ObjectId(activeTransactionId)
                    }
                };

                const guests = await Guest.aggregate([filter1, filter2, filter3]);  
                if (!guests) return;
                dbOrder = guests[0].tablesDetail.foods;

                await Promise.all(orders.map(async (order, idx) => {
                    if (order.quantity <= 0) 
                        orders[idx].operation = "R";

                    if (((order.operation) === "M") || ((order.operation) === "R")) {
                        const keyToFind = "id";
                        const valueToFind = order.id;
                        dbOrder = dbOrder.filter(object => object[keyToFind] !== valueToFind);
                    }
                }));

                await Promise.all(orders.map(async (order) => {
                    if (((order.operation) === "A") || ((order.operation) === "M")) {
                        
                        // check for item existance
                        const master = await Food.findOne(
                            {
                                _id: mongoose.Types.ObjectId(order.id), 
                                hotelId, 
                                isEnable: true
                            }
                        );    
                        if (!master) return;

                        dbOrder.push(new foodType(
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
                            "tablesDetail.$[ed].foods": dbOrder
                        }
                    },
                    { 
                        arrayFilters: [{
                            "ed._id": mongoose.Types.ObjectId(activeTransactionId)
                        }]           
                    }
                );  
            }
        // } else {
            // dbOrder = await newItemValues(hotel, orders);

            // await Guest.updateOne(
            //     {
            //         _id: mongoose.Types.ObjectId(guestId), 
            //         hotelId,
            //         isActive: true,
            //         isEnable: true
            //     },
            //     {
            //         $push: {
            //             "tablesDetail.foods": dbOrder
            //         }
            //     }
            // );  
        // }
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
                    _id: mongoose.Types.ObjectId(guestId),         
                    hotelId,
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
                
            const dbItems = await Guest.aggregate([filter1, filter2, filter3, filter4, filter5]);
    
            //append the current product to transaction document
            await Promise.all(dbItems.map(async (guest) => {
                const item = guest.tablesDetail.foods;
                if (!item) return;

                totalPriceAllInclusive += item.totalPrice;

                const data = new GuestFoodTransaction({
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
// url : hotel Id / guest Id / transaction Id
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

        const dbSum = await Guest.aggregate([filterSum1, filterSum2, filterSum3, filterSum4, filterSum5, filterSum6]);
        // End :: calculate food total

        // Start :: insert into expense if the transaction is not in guest 
        if (dbSum) {
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
                    type: "T",
                    expenseId: transactionId,
                    expenseAmount: total,
                    narration: "Expense for the food items."
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

        // // Start :: calculate & update balance
        // const filterBalance1 = {
        //     $match: {
        //         _id: mongoose.Types.ObjectId(guestId),         
        //         hotelId,
        //         isActive: true,
        //         isEnable: true
        //     }
        // };
        // const filterBalance2 = {
        //     $unwind: "$expensesPaymentsDetail"
        // };
        // const filterBalance3 = {
        //     $group: {
        //         _id: "$expensesPaymentsDetail._id",
        //         totalExpense: {$sum: "$expensesPaymentsDetail.expenseAmount"},
        //         totalPayment: {$sum: "$expensesPaymentsDetail.paymentAmount"}                        
        //     }
        // };

        // const dbBalance = await Guest.aggregate([filterBalance1, filterBalance2, filterBalance3]);
        // if (!dbBalance) return;
        // if (dbBalance.length === 0) return;

        // let totalExpense = 0;
        // let totalPayment = 0;

        // await Promise.all(dbBalance.map(async (transaction, idx) => {
        //     totalExpense += transaction.totalExpense;
        //     totalPayment += transaction.totalPayment;
        // }));

        // const balance = totalExpense + totalPayment;

        // // Start :: update balance
        // await Guest.updateOne(
        //     {
        //         _id: mongoose.Types.ObjectId(guestId), 
        //         hotelId,
        //         isActive: true,
        //         isEnable: true
        //     },
        //     {
        //         $set: {
        //             balance: balance.toFixed(0)
        //         }
        //     }
        // );  
        // // End :: update balance
        // // End :: calculate & update balance


        // Start :: get all food items 
        const filterItem1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterItem2 = {
            $unwind: "$tablesDetail"
        };
        const filterItem3 = { 
            $unwind: "$tablesDetail.foods" 
        };  
        const filterItem4 = {
            $match: {
                "tablesDetail._id": mongoose.Types.ObjectId(transactionId),
                "tablesDetail.foods.despatchDate": {$exists:true},
                "tablesDetail.foods.despatchTime": {$exists:true}
            }
        };
        const filterItem5 = {
            $group: {
                _id: "$tablesDetail._id",
                foods: {$push: "$tablesDetail.foods"}
            }
        };
    
        const dbItemList = await Guest.aggregate([filterItem1, filterItem2, filterItem3, filterItem4, filterItem5]);  
        if (!dbItemList) res.status(500).send(e);
        if (dbItemList.length === 0) res.status(500).send(e);
        const expenseId = dbItemList[0]._id;
        const foods = dbItemList[0].foods;
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
                "expensesPaymentsDetail.type": "T"
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
            foods,
            expense,
            isPaid
        );

        // End :: get all food items 
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

        //Start :: update checkout status in table
        await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId), 
                hotelId,
                isActive: true,
                isEnable: true
            },
            {
                $set: {
                    "tablesDetail.$[ele].isCheckedout": true 
                }
            },
            { 
                arrayFilters: [ 
                    {"ele._id": mongoose.Types.ObjectId(expenseId)}
                ]           
            }
        );  
        //End :: update checkout status in table

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
                        {$set: {isOccupied: false, guestId: "", guestCount: 0}});  
                }));
            }));
        }));
    
        // update out date & time
        await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId),
                hotelId,
                option: "T",
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


// async function newItemValues(hotel, orders) {
//     // insert all add items
//     const transaction = new foodTransactionType([], []);

//     try {
//         await Promise.all(orders.map(async (item) => {         
//             if ((item.operation) !== "A") return;

//             // check for item existance
//             const master = await Food.findOne(
//                 {
//                     _id: mongoose.Types.ObjectId(item.id), 
//                     hotelId: hotel._id, 
//                     isEnable: true
//                 }
//             );    
//             if (!master) return;
                    
//             transaction.foods.push(
//                 new foodType(
//                     item.id, 
//                     master.name, 
//                     master.price,
//                     item.quantity,
//                     hotel.serviceChargePercentage,
//                     hotel.foodGstPercentage
//                 ));
//         }));
//     } catch(e) {
//         return;
//     }

//     return transaction;
// };

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
            $unwind: "$tablesDetail"
        };
        const filter3 = {
            $match: {
                "tablesDetail.isCheckedout": false
            }
        };
        
        const guests = await Guest.aggregate([filter1, filter2, filter3]);
        if (!guests) return activeTransactionId; 
        if (guests.length === 0) return activeTransactionId;
        activeTransactionId = guests[0].tablesDetail._id.toHexString();
    } catch(e) {
        return;
    }

    return activeTransactionId;
};

async function getActiveTables(hotelId, guestId) {
    let tables = undefined;
    
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
            $unwind: "$tablesDetail"
        };
        const filter3 = {
            $match: {
                "tablesDetail.isCheckedout": false
            }
        };
        
        const guests = await Guest.aggregate([filter1, filter2, filter3]);
        if (!guests.length) return; 
        if (!guests[0].tablesDetail.tables.length) return;
        tables = guests[0].tablesDetail.tables;
    } catch(e) {
        return;
    }

    return tables;
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
            $unwind: "$tablesDetail"
        };
        const filter3 = { 
            $match: {
                "tablesDetail.isCheckedout": false
            }
        };
        const filter4 = { 
            $unwind: "$tablesDetail.foods"
        };
        const filter5 = {
            $match: {
                "tablesDetail.foods.despatchDate": {$exists: false},
                "tablesDetail.foods.despatchTime": {$exists: false}
            }
        };
                
        const dbItems = await Guest.aggregate([filter1, filter2, filter3, filter4, filter5]);

        await Promise.all(dbItems.map(async (dbItem) => {    
            const item = dbItem.tablesDetail.foods;

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
                orderDate: item.orderDate,
                orderTime: item.orderTime
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
    handelAssignTable,
    handelOrder,
    handelDelivery,
    handelGenerateBill,
    handelPayment,
    handelCheckout,
    getActiveId,
    getActiveTables
};