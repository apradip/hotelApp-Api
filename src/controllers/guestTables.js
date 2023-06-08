const mongoose = require("mongoose");
const Hotel = require("./hotels");
const Guest = require("../models/guests");
const Table = require("../models/tables");
const Food = require("../models/foods");
const GuestFoodTransaction = require("../models/guestFoodsTransaction");
const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
const date = require("date-and-time");

class foodType {
    constructor(id, name, unitPrice, quantity, serviceChargePercentage, gstPercentage, orderDate, orderTime) {
      this.foodId = id;
      this.name = name;
      this.unitPrice = unitPrice;
      this.quantity = quantity;
      this.serviceChargePercentage = serviceChargePercentage;
      this.serviceCharge = (unitPrice * quantity) * (serviceChargePercentage / 100);
      this.gstPercentage = gstPercentage;
      this.gstCharge = (unitPrice * quantity) * (gstPercentage / 100);
      this.totalPrice = parseInt(unitPrice * quantity) + parseInt(this.serviceCharge) + parseInt(this.gstPercentage);
      this.orderDate = orderDate;
      this.orderTime = orderTime;
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
    let returnList = [];
    const hotelId = req.params.hotelId;
    const search = req.query.search;

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
                roomsDetail: 0, servicesDetail: 0, miscellaneousesDetail: 0
            }
        };

        if (!search) {
            const pipeline = [filter1, filter3];
            const data = await Guest.aggregate(pipeline);
            if (!data) return res.status(404).send();

            await Promise.all(data.map(async (element) => {
                const item = {
                    id: element._id,
                    name: element.name,
                    mobile: element.mobile,
                    guestCount: element.guestCount,
                    corporateName: element.corporateName,
                    corporateAddress: element.corporateAddress,
                    gstNo: element.gstNo,
                    transactionId: element.tablesDetail[element.tablesDetail.length - 1]._id, 
                    tables: element.tablesDetail[element.tablesDetail.length - 1].tables,
                    inDate: element.inDate,
                    inTime: element.inTime,
                    totalExpense: await totalExpense(element.expensesPaymentsDetail),
                    totalBalance: element.balance
                };
                
                returnList.push(item);
            }));

        } else {
            const pipeline = [filter1, filter2, filter3];
            const data = await Guest.aggregate(pipeline); 
            if (!data) return res.status(404).send();

            await Promise.all(data.map(async (element) => {
                let tables = "";
                element.tablesDetail[element.tablesDetail.length - 1].tables.map(async (table) => {
                    tables.length > 0 ?  tables = tables + ", " + table.no : tables = table.no;
                });

                const item = {
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
                    totalExpense: await totalExpense(element.expensesPaymentsDetail),
                    totalBalance: element.balance
                };

                returnList.push(item);
            }));
        }

    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(returnList);
};


// handel show all orders
//query string : hotel Id / guest Id 
//query string : option = option: [non delivery / all]
const handelDetail = async (req, res) => {
    let foodList = [];

    const {hotelId, guestId} = req.params;
    const option = req.query.option;

    try {
        let foundGuestFoodList = null;

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
                $unwind: "$tablesDetail"
            };
            const filter3 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, servicesDetail: 0, miscellaneousesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0    
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

            const pipeline = [filter1, filter2, filter3, filter4, filter5];
            foundGuestFoodList = await Guest.aggregate(pipeline);

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
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, servicesDetail: 0, miscellaneousesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0
                }
            };
            const filter4 = { 
                $unwind: "$tablesDetail.foods"
            }; 

            const pipeline = [filter1, filter2, filter3, filter4];
            foundGuestFoodList = await Guest.aggregate(pipeline);  
        } 

        if (!foundGuestFoodList) return res.status(404).send();

        foundGuestFoodList.forEach(async tablesDetail => {
            const transactionId = tablesDetail.tablesDetail._id;
            const food = tablesDetail.tablesDetail.foods;
            
            const dataOrder = {
                transactionId: transactionId,
                foodTransactionId: food._id,
                foodId: food.foodId,
                name: food.name,
                quantity: food.quantity,
                unitPrice: food.unitPrice,
                serviceChargePercentage: food.serviceChargePercentage,
                serviceCharge: food.serviceCharge,
                gstPercentage: food.gstPercentage,
                gstCharge: food.gstCharge,
                totalPrice: food.totalPrice,
                orderDate: food.orderDate,
                orderTime: food.orderTime,
                despatchDate: food.despatchDate,
                despatchTime: food.despatchTime
            };

            foodList.push(dataOrder);
        });
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(foodList);
};


// handel order
//query string : hotel Id / guest Id
//body : {"transactionId": "", "foods": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    try {
        const {hotelId, guestId, transactionId} = req.params;
        const {foods} = req.body;

        let foodsDb = undefined;
        
        // get hotel tax details    
        const hotel = await Hotel.detail(hotelId);

        // if (transactionId !== undefined) {
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
                        roomsDetail: 0, miscellaniousesDetail: 0, servicesDetail: 0,
                        expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                        option: 0, isActive: 0, isEnable: 0, updatedDate: 0
                    }
                };
                const pipelineSum = [filter1, filter2, filter3, filter4];
                const resFoodsDetail = await Guest.aggregate(pipelineSum);  
                if (!resFoodsDetail) return res.status(404).send();
                
                foodsDb = resFoodsDetail[0].tablesDetail.foods;

                for (const food of foods) {        
                    if (food) {
                        if (((food.operation) === "M") || ((food.operation) === "R")) {
                            const keyToFind = "id";
                            const valueToFind = food.id;
                            foodsDb = foodsDb.filter(obj => obj[keyToFind] !== valueToFind);
                        }
                    }
                }

                for (const food of foods) {       
                    if (((food.operation) === "A") || ((food.operation) === "M")) {
                        
                        // check for item existance
                        const foundFood = await Food.findOne(
                            {
                                _id: mongoose.Types.ObjectId(food.id), 
                                hotelId: hotel._id, 
                                isEnable: true
                            }
                        );    
        
                        if (foundFood) {
                            foodsDb.push(new foodType(
                                foundFood._id, 
                                foundFood.name, 
                                parseInt(foundFood.price).toFixed(hotel.fincialDecimalPlace),
                                parseInt(food.quantity),
                                parseInt(hotel.serviceChargePercentage).toFixed(hotel.fincialDecimalPlace),
                                parseInt(hotel.foodGstPercentage).toFixed(hotel.fincialDecimalPlace),
                                date.format(new Date(), "YYYY-MM-DD"), 
                                date.format(new Date(), "HH:mm")
                            ));
                        }
                    }
                }

                const resFoodUpdate = await Guest.updateOne(
                    {
                        _id: mongoose.Types.ObjectId(guestId), 
                        hotelId,
                        isActive: true,
                        isEnable: true
                    },
                    {
                        $set: {
                            "tablesDetail.$[ed].foods": foodsDb
                        }
                    },
                    { 
                        arrayFilters: [{
                            "ed._id": mongoose.Types.ObjectId(transactionId)
                        }]           
                    }
                );  
                if (!resFoodUpdate) return res.status(404).send();
            }
        // } else {
        //     foodsDb = await newFoodValues(hotel, foods);

        //     const resFoodUpdate = await Guest.updateOne(
        //         {
        //             _id: mongoose.Types.ObjectId(guestId), 
        //             hotelId,
        //             isActive: true,
        //             isEnable: true
        //         },
        //         {
        //             $set: {
        //                 'tablesDetail.$[ed].foods': foodsDb
        //             }
        //         },
        //         { 
        //             arrayFilters: [{
        //                 'ed._id': mongoose.Types.ObjectId(transactionId)
        //             }]           
        //         }
        //     );  
        //     if (!resFoodUpdate) return res.status(404).send();

        // }

        return res.status(200).send();
    } catch(e) {
        return res.status(500).send(e);
    }
};

// async function newFoodValues(hotel, foods) {
//     // insert all add / modify operation items
//     const transaction = new foodTransactionType(
//         [], 
//         date.format(new Date(), "YYYY-MM-DD"), 
//         date.format(new Date(), "HH:mm"));

//     for (const food of foods) {       
            
//         // delete all remove / modify operation service    
//         if ((food.operation) === "A") {
            
//             // check for item existance
//             const foundFood = await Food.findOne(
//                 {
//                     _id: mongoose.Types.ObjectId(food.id), 
//                     hotelId: hotel._id, 
//                     isEnable: true
//                 }
//             );    

//             if (foundFood) {
//                 transaction.tables.push(new foodType(
//                     food.id, 
//                     foundFood.name, 
//                     parseInt(foundFood.price).toFixed(hotel.fincialDecimalPlace),
//                     parseInt(food.quantity),
//                     parseInt(hotel.serviceChargePercentage).toFixed(hotel.fincialDecimalPlace),
//                     parseInt(hotel.foodGstPercentage).toFixed(hotel.fincialDecimalPlace)
//                 ));
//             }
//         }
//     }

//     return transaction;
// };


// handel delivery
//query string : hotel Id / guest Id / transaction Id
const handelDelivery = async (req, res) => {
    try {
        const {hotelId, guestId, transactionId} = req.params;
        const {foods} = req.body;

        for (const item of foods) {    
            if (item) {
                // update all delivery date & time
                const resDelivery = await Guest.updateOne(
                    {
                        _id: mongoose.Types.ObjectId(guestId), 
                        hotelId: hotelId,
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
                            {"fele._id": mongoose.Types.ObjectId(item.foodTransactionId)}
                        ]           
                    }
                );  
                if (!resDelivery) return res.status(404).send(resDelivery);


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
                    $project: {
                        _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                        corporateName: 0, corporateAddress: 0, gstNo: 0, 
                        roomsDetail: 0, servicesDetail: 0, miscellaneousesDetail: 0,
                        expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                        option: 0, isActive: 0, isEnable: 0, 'tablesDetail.tables': 0
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
                        "tablesDetail.foods._id": mongoose.Types.ObjectId(item.foodTransactionId)
                    }
                };
                
                const pipelineFood = [filter1, filter2, filter3, filter4, filter5, filter6];
                const resFood = await Guest.aggregate(pipelineFood);
                if (!resFood) return res.status(404).send();
        

                //append the current product to transaction document
                for (const item of resFood) {
                    //const balance = item.balance;
                    const food = item.tablesDetail.foods;

                    if (food) {
                        const data = new GuestFoodTransaction({
                            hotelId ,
                            guestId,
                            foodId: food.foodId,
                            name: food.name,
                            serviceChargePercentage: food.serviceChargePercentage,
                            serviceCharge: food.serviceCharge,
                            gstPercentage: food.gstPercentage,
                            gstCharge: food.gstCharge,
                            unitPrice: food.unitPrice,
                            quantity: food.quantity,
                            totalPrice: food.totalPrice,
                            orderDate: food.orderDate,
                            orderTime: food.orderTime,
                            despatchDate: food.despatchDate,
                            despatchTime: food.despatchTime
                        });
                
                        const resAddTransaction = await data.save();
                        if (!resAddTransaction) return res.status(400).send();


                        //update banalce
                        //increase balance with product total
                        const resBalance = await Guest.updateOne(
                            {
                                _id: mongoose.Types.ObjectId(guestId), 
                                hotelId: hotelId,
                                isActive: true,
                                isEnable: true
                            },
                            {
                                $inc: {
                                    balance: (food.totalPrice * -1)
                                }
                            }
                        );  
                        if (!resBalance) return res.status(404).send(resBalance);
                    }
                }   
            }
        }

        return res.status(200).send();
    } catch(e) {
        return res.status(500).send(e);
    }
};


// handle guest bill summery
//query string : hotel Id / guest Id
const handelGenerateBill = async (req, res) => {
    const {hotelId, guestId} = req.params;
    const {transactionId} = req.body;

    try {
        // calculate and update miscellaneous total
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

        // const filter4 = {
        //     $project: {
        //         _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
        //         corporateName: 0, corporateAddress: 0, gstNo: 0, 
        //         roomsDetail: 0, servicesDetail: 0, miscellaneousesDetail: 0,
        //         expensesPaymentsDetail: 0, balance: 0, inDate: 0, inTime: 0,
        //         option: 0, isActive: 0, isEnable: 0
        //     }
        // };

        const filter4 = { 
            $unwind: "$tablesDetail.foods" 
        };  

        const filter5 = {
            $group: {
                _id: "$tablesDetail._id",
                total: {$sum: "$tablesDetail.foods.totalPrice"}
            }
        };

        const pipelineSum = [filter1, filter2, filter3, filter4, filter5];
        const resSum = await Guest.aggregate(pipelineSum);
        if (!resSum) return res.status(404).send();


        // insert into expense if the transaction is not present
        for (const sum of resSum) {
            // get hotel last bill no
            let billNo = await Hotel.getLastBillNo(hotelId);
            billNo += 1; 

            const resExpenseUpdate = await Guest.updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId),
                    "expensesPaymentsDetail": {
                        $not: {
                            $elemMatch: {
                                expenseId: mongoose.Types.ObjectId(sum._id)
                            }
                        }
                    }
                },
                {
                    $push: {
                        "expensesPaymentsDetail": new expenseType(sum._id, billNo, sum.total)
                    }
                }
            );
            if (!resExpenseUpdate) return res.status(400).send();

            //add into expense payment transaction
            const foundExpense = await GuestExpensesPaymentsTransaction.findOne(
                {
                    hotelId, 
                    isEnable: true,
                    expenseId: sum._id
                }
            );    

            if (!foundExpense) {
                const data = new GuestExpensesPaymentsTransaction({
                    hotelId,
                    guestId,
                    billNo: billNo,
                    type: "T",
                    expenseId: sum._id,
                    expenseAmount: sum.total,
                    narration: "Expense for the food items."
                });
    
                const resAdd = await data.save();
                if (!resAdd) return res.status(400).send();
            }

            // set hotel last bill no
            await Hotel.setLastBillNo(hotelId, billNo);
        }


        // get all food item 
        const billFilter1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId: hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const billFilter2 = {
            $unwind: "$expensesPaymentsDetail"
        };
        const billFilter3 = {
            $match: {
                "expensesPaymentsDetail.type": "T"
            }
        };
        const billFilter4 = {
            $project: {
                _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                corporateName: 0, corporateAddress: 0, gstNo: 0, 
                roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0, servicesDetail: 0,
                balance: 0, inDate: 0, inTime: 0,
                option: 0, isActive: 0, isEnable: 0
            }
        };
        const billFilter5 = {
             $sort: {"expensesPaymentsDetail.billNo": -1} 
        };

        const pipelineBill = [billFilter1, billFilter2, billFilter3, billFilter4, billFilter5];
        const resBill = await Guest.aggregate(pipelineBill);  
        if (!resBill) return res.status(404).send();
        
        return res.status(200).send(resBill);
    } catch(e) {
        return res.status(500).send(e);
    }
};


// handle guest bill summery
//query string : hotel Id / guest Id / transaction Id
const handelBillDetail = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;

    try {
        // calculate and update food total
        const filter1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId: hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filter2 = {
            $unwind: '$tablesDetail'
        };
        const filter3 = {
            $match: {
                'tablesDetail._id': mongoose.Types.ObjectId(transactionId)
                
            }
        };
        const filter4 = {
            $project: {
                _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                corporateName: 0, corporateAddress: 0, gstNo: 0, 
                roomsDetail: 0, servicesDetail: 0, miscellaneousesDetail: 0,
                expensesPaymentsDetail: 0, balance: 0, inDate: 0, inTime: 0,
                option: 0, isActive: 0, isEnable: 0
            }
        };
        const filter5 = { 
            $unwind: '$tablesDetail.foods' 
        };  

        const pipelineBill = [filter1, filter2, filter3, filter4, filter5];
        const resBill = await Guest.aggregate(pipelineBill);
        if (!resBill) return res.status(404).send();

        return res.status(200).send(resBill);

    } catch(e) {
        return res.status(500).send(e);
    }
};


// handle guest checkout 
//query string : hotel Id / guest Id
const handelCheckout = async (req, res) => {
    const {hotelId, guestId} = req.params;

    try {
        //get last transaction id
        //get all tables id of that transaction
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

        const pipeline = [filter1, filter2];
        const foundTableDetails = await Guest.aggregate(pipeline);  


        //update all tables guestid it null & occupied status is false
        foundTableDetails.forEach(async (item) => {
            item.tablesDetail.forEach(async (tableDetail) => {
                tableDetail.tables.forEach(async (table) => {
                    const tableId = table.id;
                    const resRelese = await Table.findByIdAndUpdate(
                                            mongoose.Types.ObjectId(tableId), 
                                            {$set: {isOccupied: false,
                                                    guestId: ""}}                                        
                                            );  
                    if (!resRelese) return res.status(404).send();                                            
                });
            });
        });

    
        // update out date & time
        const resUpdateOut = await Guest.findByIdAndUpdate(
            mongoose.Types.ObjectId(guestId), 
            {$set: {isActive: false,
                    outDate: date.format(new Date(), "YYYY-MM-DD"), 
                    outTime: date.format(new Date(), "HH:mm")}}
        );  

        if (!resUpdateOut) return res.status(404).send();

    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
};


async function totalExpense(detail) {
    let total = 0;

    for (const exp of detail) {
        exp.type !== "P" ? total += exp.expenseAmount : total += 0;
    }

    return total;
};


module.exports = {
    handelSearch,
    handelDetail,
    handelOrder,
    handelDelivery,
    handelGenerateBill,
    handelBillDetail,
    handelCheckout
};