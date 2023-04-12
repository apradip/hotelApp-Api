const mongoose = require('mongoose');
const Hotel = require('./hotels');
const Guest = require('../models/guests');
const Table = require("../models/tables");
const Food = require('../models/foods');
const GuestFoodTransaction = require('../models/guestFoodsTransaction');
const date = require('date-and-time');


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
      this.unitPrice = unitPrice;
      this.quantity = quantity;
      this.serviceChargePercentage = serviceChargePercentage;
      this.serviceCharge = (unitPrice * quantity) * (serviceChargePercentage / 100)
      this.gstPercentage = gstPercentage;
      this.gstCharge = (unitPrice * quantity) * (gstPercentage / 100)
      this.totalPrice = parseInt(unitPrice * quantity) + parseInt(this.serviceCharge) + parseInt(this.gstPercentage)
    }
};

class foodTransactionType {
    constructor(tables, foods, orderDate, orderTime) {
        this.tables = tables;
        this.foods = foods;
        this.orderDate = orderDate;
        this.orderTime = orderTime;
    }
};

class expenseTransactionType {
    constructor(expenseId, expenseAmount) {
        this.type = "F",
        this.expenseId = expenseId,
        this.expenseAmount = expenseAmount,
        this.narration = 'Expense for the food items.'
    }
}



//handel add guest table
//query string : hotel Id / guest Id
//body : {"tables": [{"id": ""}]}
const handelTableBooking = async (req, res) => {
    try {
        const { hotelId, guestId } = req.params;
        const { tables } = req.body;

        const transaction = new foodTransactionType(
            [], [], 
            date.format(new Date(),'YYYY-MM-DD'), 
            date.format(new Date(),'HH:mm'));
    
        for(const table of tables) {
            // check if the table is empty
            const filter = {
                _id: mongoose.Types.ObjectId(table.id), 
                hotelId: hotelId, 
                isOccupied: false, 
                isEnable: true
            };
            const foundTable = await Table.findOne(filter);

            if (foundTable) {
                transaction.tables.push(new tableType(
                    table.id, 
                    foundTable.no
                ));
            }

            const update = {
                guestId: guestId, 
                isOccupied: true, 
                updatedDate: new Date()
            };
            const resTableUpdate = await Table.updateOne(filter, update);
            if (!resTableUpdate) return res.status(404).send();
        }

        const filterGuest = {_id: guestId};
        const updateGuest = {$push: {tablesDetail: transaction}};
        const resGuestUpdate = await Guest.updateOne(filterGuest, updateGuest);  
        if (!resGuestUpdate) return res.status(404).send();

    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
}



// handel show all orders
//query string : hotel Id / guest Id / option: [non checkout / all]
const handelDetail = async (req, res) => {
    let foodList = [];

    try {
        const { hotelId, guestId, option } = req.params;
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
                $unwind: '$tablesDetail'
            };
            const filter3 = {
                $match: {
                    'tablesDetail.despatchDate': { $exists: false },
                    'tablesDetail.despatchTime': { $exists: false }
                }
            };
            const filter4 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, miscellaneousesDetail: 0, servicesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0, updatedDate: 0
    
                }
            };
            const filter5 = { 
                $unwind: '$tablesDetail.foods' 
            };  
            const pipeline = [filter1, filter2, filter3, filter4, filter5];
            foundGuestFoodList = await Guest.aggregate(pipeline);  

        } else if (option === "A") {
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
                    'tablesDetail.despatchDate': { $exists: true },
                    'tablesDetail.despatchTime': { $exists: true }
                }
            };
            const filter4 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, miscellaneousesDetail: 0, servicesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0, updatedDate: 0
    
                }
            };
            const filter5 = { 
                $unwind: '$tablesDetail.foods' 
            };  
            const pipeline = [filter1, filter2, filter3, filter4, filter5];
            foundGuestFoodList = await Guest.aggregate(pipeline);  

        } else if (option.length === 24) {
            const filter1 = {
                $match: {
                    _id: mongoose.Types.ObjectId(guestId),         
                    hotelId,
                    isActive: true,
                    isEnable: true
                }
            };
            const filter2 = {
                $unwind: '$tablesDetail'
            };
            const filter3 = {
                $match: {
                    'tablesDetail._id': mongoose.Types.ObjectId(option),
                }
            };
            const filter4 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, miscellaneousDetail: 0, servicesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0, updatedDate: 0
    
                }
            };
            const filter5 = { 
                $unwind: '$tablesDetail.foods' 
            };  
            const pipeline = [filter1, filter2, filter3, filter4, filter5];
            foundGuestFoodList = await Guest.aggregate(pipeline);  
    
            if (!foundGuestFoodList) return res.status(404).send();
    
        }

        if (!foundGuestFoodList) return res.status(404).send();

        foundGuestFoodList.forEach(async foodDetail => {
            const food = foodDetail.tablesDetail.foods;
            
            const dataOrder = {
                id: food.id,
                name: food.name,
                unitPrice: food.price,
                quantity: food.quantity,
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
}


// handel food order
//query string : hotel Id / guest Id / transaction Id
//body : {"foods": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    try {
        const { hotelId, guestId, transactionId } = req.params;
        const { foods } = req.body;

        let foodsDb = undefined;
        
        // get hotel tax details    
        const hotel = await Hotel.detail(hotelId);

        if (transactionId !== undefined) {
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
                                parseInt(hotel.foodGstPercentage).toFixed(hotel.fincialDecimalPlace)
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
                            'tablesDetail.$[ed].foods': foodsDb
                        }
                    },
                    { 
                        arrayFilters: [{
                            'ed._id': mongoose.Types.ObjectId(transactionId)
                        }]           
                    }
                );  
                if (!resFoodUpdate) return res.status(404).send();

            } else {
                
                foodsDb = await newFoodValues(hotel, foods);
            }
        } else {

            foodsDb = await newFoodValues(hotel, foods);

            const resFoodUpdate = await Guest.updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId), 
                    hotelId,
                    isActive: true,
                    isEnable: true
                },
                {
                    $set: {
                        'tablesDetail.$[ed].foods': foodsDb
                    }
                },
                { 
                    arrayFilters: [{
                        'ed._id': mongoose.Types.ObjectId(transactionId)
                    }]           
                }
            );  
            if (!resFoodUpdate) return res.status(404).send();

        }

        return res.status(200).send();
    } catch(e) {
        return res.status(500).send(e);
    }
}

async function newFoodValues(hotel, foods) {
    const foodList = [];

    for (const food of foods) {       
            
        // delete all remove / modify operation    
        if ((food.operation) === "A") {
            
            // check for item existance
            const foundFood = await Food.findOne(
                {
                    _id: mongoose.Types.ObjectId(food.id), 
                    hotelId: hotel._id, 
                    isEnable: true
                }
            );    

            if (foundFood) {
                foodList.push(new foodType(
                    food.id, 
                    foundFood.name, 
                    parseInt(foundFood.price).toFixed(hotel.fincialDecimalPlace),
                    parseInt(food.quantity),
                    parseInt(hotel.serviceChargePercentage).toFixed(hotel.fincialDecimalPlace),
                    parseInt(hotel.foodGstPercentage).toFixed(hotel.fincialDecimalPlace)
                ));
            }
        }
    }

    return foodList;
}



// handel food delivery
//query string : hotel Id / guest Id / transaction Id
//body : {"foods": [{"id": ""}]}
const handelDelivery = async (req, res) => {
    try {
        const { hotelId, guestId, transactionId } = req.params;

        // update all delivery date & time
        const resDelivery = await Guest.updateOne(
            {
                hotelId: hotelId,
                _id: mongoose.Types.ObjectId(guestId), 
                isActive: true,
                isEnable: true
            },
            {
                $set: {
                    'tablesDetail.$[ele].despatchDate': date.format(new Date(),'YYYY-MM-DD'), 
                    'tablesDetail.$[ele].despatchTime': date.format(new Date(),'HH:mm')
                }
            },
            { 
                arrayFilters: [{ 
                    'ele._id': mongoose.Types.ObjectId(transactionId)
                }]           
            }
        );  
        if (!resDelivery) return res.status(404).send(resDelivery);

        return res.status(200).send(resDelivery);
    } catch(e) {
        return res.status(500).send(e);
    }
   
}


// handle table checkout 
//query string : hotel Id / guest Id / transaction Id
const handelCheckout = async (req, res) => {
    try {
        const { hotelId, guestId, transactionId } = req.params;

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
                roomsDetail: 0, miscellaneousDetail: 0, servicesDetail: 0,
                expensesPaymentsDetail: 0, balance: 0, inDate: 0, inTime: 0,
                option: 0, isActive: 0, isEnable: 0, updatedDate: 0
            }
        };
        const filter5 = { 
            $unwind: '$tablesDetail.foods' 
        };  
        const filter6 = {
            $group: {
              _id: null,
              total: { $sum: "$tablesDetail.foods.totalPrice" }
            }
        };

        const pipelineSum = [filter1, filter2, filter3, filter4, filter5, filter6];
        const resFoods = await Guest.aggregate(pipelineSum);  
        if (!resFoods) return res.status(404).send();

        // insert miscellaneous to guest miscellaneous 
        const pipelineItems = [filter1, filter2, filter3, filter4, filter5];
        const resItems = await Guest.aggregate(pipelineItems);  
        if (!resItems) return res.status(404).send();

        for (const itemDetail of resItems) {    
            if (itemDetail) {
                const food = itemDetail.tablesDetail.foods;
                const data = new GuestFoodTransaction({
                    hotelId,
                    guestId,
                    foodId: food.id,
                    name: food.name,
                    serviceChargePercentage: food.serviceChargePercentage,
                    serviceCharge: food.serviceCharge,
                    gstPercentage: food.gstPercentage,
                    gstCharge: food.gstCharge,
                    unitPrice: food.unitPrice,
                    quantity: food.quantity,
                    totalPrice: food.totalPrice,
                    orderDate: itemDetail.tablesDetail.orderDate,
                    orderTime: itemDetail.tablesDetail.orderTime,
                    despatchDate: itemDetail.tablesDetail.despatchDate,
                    despatchTime: itemDetail.tablesDetail.despatchTime
                });
        
                const resAdd = await data.save();
                if (!resAdd) return res.status(400).send();
            }
        }

        // insert into expense if the transaction is not present
        const resExpenseUpdate = await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId),
                'expensesPaymentsDetail': {
                    $not: {
                        $elemMatch: {
                            expenseId: transactionId
                        }
                    }
                }
            },
            {
                $push: {
                    'expensesPaymentsDetail': new expenseTransactionType(transactionId, resFoods[0].total)
                }
            }
        );    
        if (!resExpenseUpdate) return res.status(400).send();

        // update balance
        const resUpdateBalance = await Guest.findByIdAndUpdate(
            mongoose.Types.ObjectId(guestId), 
            { $inc: { balance: (resFoods[0].total * -1) } }
        );  
        if (!resUpdateBalance) return res.status(404).send();


        // update isPostedToExpense status
        const resUpdateExpenseStatus = await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId), 
                hotelId,
                isActive: true,
                isEnable: true
            },
            {
                $set: {
                    'tablesDetail.$[ed].isPostedToExpense': true
                }
            },
            { 
                arrayFilters: [{
                    'ed._id': mongoose.Types.ObjectId(transactionId)
                }]           
            }
        );  
        if (!resUpdateExpenseStatus) return res.status(404).send();

    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
}

module.exports = {
    handelTableBooking,
    handelDetail,
    handelOrder,
    handelDelivery,
    handelCheckout
}