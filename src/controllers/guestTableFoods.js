const Guest = require("../models/guests");
const Table = require("../models/tables");
const Food = require("../models/foods");
const date = require("date-and-time");

const decimalPlace = 2;
const serviceChargePercentage = 12.5;
const gstPercentage = 10.4;

const foodItem = {
    id: "",
    name: "",
    quantity: 0,
    serviceChargePercentage: 0,
    serviceCharge: 0,
    gstPercentage: 0,
    gstCharge: 0,
    price: 0,
    orderDate: "",
    orderTime: ""
};


//handel add guest table
//query string : hotel Id / guest Id
//body : {"tables": [{"id": ""}]}
const handelTableBooking = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;
        const {tables} = req.body;

        const foundGuest = await Guest.findOne(
            {
                hotelId, _id: guestId, 
                isActive: true, 
                isEnable: true
            }).exec();
        if (!foundGuest) return res.status(404).send();
 
        tables.forEach(async table => {
            // check if the table is empty
            const foundTable = await Table.findOne(
                {
                    hotelId, 
                    _id: table.id, 
                    isOccupied: false, 
                    isEnable: true
                }).exec();

            if (foundTable) {
                // change table occupancy status
                const resTableUpdate = await Table.findOneAndUpdate(
                    {
                        hotelId, 
                        _id: foundTable._id
                    },
                    {
                        guestId: guestId, 
                        isOccupied: true, 
                        updatedDate: new Date()
                    }).exec();  

                if (resTableUpdate) { 
                    //add table in the guest
                    const dataTable = {
                                id: foundTable._id,
                                no: foundTable.no, 
                                inDate: date.format(new Date(),'YYYY-MM-DD'),
                                inTime: date.format(new Date(),'HH:mm')
                            };

                    const resGuestUpdate = await Guest.findOneAndUpdate(
                        {_id: foundGuest._id},
                        {$push: {'tablesDetail.tables': dataTable}}).exec();  

                    if (!resGuestUpdate) return res.status(400).send();
                } else {
                    return res.status(400).send("Not able to update table");    
                }
            } else {
                return res.status(400).send("Table (" + table.id + ") not found ");
            }
        });

        return res.status(200).send();
    } catch(e) {
        return res.status(500).send(e);
    }        
}


// handel show all orders
//query string : hotel Id / guest Id / option: [non checkout / all]
const handelDetail = async (req, res) => {
    let foodList = [];

    try {
        const {hotelId, guestId, option} = req.params;
        
        let foundGuestFoodList = null;

        if (option === "N") {
            foundGuestFoodList = await Guest.findOne(
                {
                    hotelId, 
                    _id: guestId, 
                    isActive: true, 
                    isEnable: true, 
                    'tablesDetail.tables': {
                        $elemMatch: {
                            outDate: null, 
                            outTime: null
                        }
                    }
                }
            ).exec();        
            // if (!foundGuestFoodList) return res.status(404).send();
        } else if (option === "A") {
            foundGuestFoodList = await Guest.findOne(
                {
                    hotelId, 
                    _id: guestId, 
                    isActive: true, 
                    isEnable: true, 
                    'tablesDetail.tables': {
                        $elemMatch: {
                            outDate: { $ne: null }, 
                            outTime: { $ne: null }
                        }
                    }
                }
            ).exec();        
            // if (!foundGuestFoodList) return res.status(404).send();
        }

        if (!foundGuestFoodList) return res.status(404).send();

        foundGuestFoodList.tablesDetail.tables.forEach(async table => {
            table.foods.forEach(async food => {
                let dataOrder = foodItem;
                dataOrder.id = food.id;
                dataOrder.name = food.name;
                dataOrder.price = food.price;
                dataOrder.quantity = food.quantity;
                dataOrder.serviceChargePercentage = food.serviceChargePercentage;
                dataOrder.serviceCharge = food.serviceCharge;
                dataOrder.gstPercentage = food.gstPercentage;
                dataOrder.gstCharge = food.gstCharge;
                dataOrder.orderDate = food.orderDate;
                dataOrder.orderTime = food.orderTime;
                foodList.push(dataOrder);   
            });
        });
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(foodList);
}

// handel food order
//query string : hotel Id / guest Id / table Id
//body : {"foods": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    try {
        const {hotelId, guestId, tableId} = req.params;
        const {foods} = req.body;

        // get guest
        const foundGuest = await Guest.findOne(
            {
                hotelId, 
                _id: guestId, 
                isActive: true, 
                isEnable: true
            }
        ).exec();

        if (!foundGuest) return res.status(404).send();

        // get table
        const foundTable = await Table.findOne(
            {
                hotelId, 
                guestId: guestId, 
                _id: tableId, 
                isOccupied: true, 
                isEnable: true
            }
        ).exec();

        if (!foundTable) return res.status(404).send();

        // delete all remove / modify operation foods    
        foods.forEach(async food => {
            if (((food.operation) === "M") || ((food.operation) === "R")) {
                const resFoodRemove = await Guest.updateOne(
                    {
                        _id: guestId, 
                        'tablesDetail.tables': {
                            $elemMatch: {
                                id: tableId, 
                                outDate: null, 
                                outTime: null
                            }
                        }, 
                        'tablesDetail.tables.$.foods': {
                            $elemMatch: {
                                despatchDate: null, 
                                despatchTime: null
                            }
                        }
                    },
                    {
                        $pull: {
                            'tablesDetail.tables.$.foods': { 
                                id: food.id,
                                despatchDate: null 
                            }
                        }
                    }
                ).exec();  
        
                if (!resFoodRemove) return res.status(404).send();
            }
        });

        // insert all add / modify operation foods
        foods.forEach(async food => {
            // delete all remove / modify operation foods    
            if (((food.operation) === "A") || ((food.operation) === "M")) {
                // check for food existance
                const foundFood = await Food.findOne(
                    {
                        hotelId, 
                        _id: food.id, 
                        isEnable: true
                    }
                ).exec();

                if (!foundFood) return res.status(404).send();

                //add food in the guest table
                const dataOrder = {
                    id: food.id,
                    name: foundFood.name, 
                    price: parseInt(foundFood.price).toFixed(decimalPlace),
                    quantity: food.quantity,
                    serviceChargePercentage: parseInt(serviceChargePercentage).toFixed(decimalPlace),
                    serviceCharge: parseInt(((foundFood.price * food.quantity) * (serviceChargePercentage / 100))).toFixed(decimalPlace),
                    gstPercentage: gstPercentage,
                    gstCharge: parseInt(((foundFood.price * food.quantity) * (gstPercentage / 100))).toFixed(decimalPlace),
                    orderDate: date.format(new Date(),'YYYY-MM-DD'),
                    orderTime: date.format(new Date(),'HH:mm')
                };
    
                const resOrderUpdate = await Guest.findOneAndUpdate(
                    {
                        _id: guestId, 
                        'tablesDetail.tables': {
                            $elemMatch:{
                                id: tableId, 
                                outDate: null, 
                                outTime: null
                            }
                        }
                    },
                    {
                        $push: {
                            'tablesDetail.tables.$.foods': dataOrder
                        }
                    }
                ).exec();  

                if (!resOrderUpdate) return res.status(400).send();
            }
        });
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
}


// handel food delivery
//query string : hotel Id / guest Id / table Id
//body : {"foods": [{"id": ""}]}
const handelDelivery = async (req, res) => {
    try {
        const {hotelId, guestId, tableId} = req.params;
        const {foods} = req.body;

        // get guest
        const foundGuest = await Guest.findOne(
            {
                hotelId, 
                _id: guestId, 
                isActive: true, 
                isEnable: true
            }
        ).exec();

        if (!foundGuest) return res.status(404).send();

        // get table
        const foundTable = await Table.findOne(
            {
                hotelId, 
                guestId: guestId, 
                _id: tableId, 
                isOccupied: true, 
                isEnable: true
            }
        ).exec();

        if (!foundTable) return res.status(404).send();

        // update all delivery date & time
        foods.forEach(async food => {
            const resFoodDelivery = await Guest.findOneAndUpdate(
                {
                    _id: guestId, 
                    'tablesDetail.tables': {
                        $elemMatch: {
                            id: tableId, 
                            outDate: null, 
                            outTime: null
                        }
                    }, 
                    'tablesDetail.tables.foods': {
                        $elemMatch: {
                            id: food.id,
                            despatchDate: null,
                            despatchTime: null
                        }
                    }
                },
                {
                    $set: {
                        'tablesDetail.tables.$[et].foods.$[ef].despatchDate': date.format(new Date(),'YYYY-MM-DD'), 
                        'tablesDetail.tables.$[et].foods.$[ef].despatchTime': date.format(new Date(),'HH:mm')
                    }
                },
                {
                    arrayFilters: [
                        { 'et.id': tableId },
                        { 'ef.id': food.id }
                    ]
                }
            ).exec();  
    
            if (!resFoodDelivery) return res.status(404).send();
        });
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
}


// handle table checkout 
//query string : hotel Id / guest Id
const handelCheckout = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;

        // get guest
        const foundGuest = await Guest.findOne(
            {
                hotelId, 
                _id: guestId, 
                isActive: true, 
                isEnable: true
            }
        ).exec();

        if (!foundGuest) return res.status(404).send();

        // get tables
        const foundTables = await Table.find(
            {
                hotelId, 
                guestId: guestId, 
                isOccupied: true, 
                isEnable: true
            }
        ).exec();

        if (!foundTables) return res.status(404).send();

        // calculate and update table food total
        let foodTotal = 0;

        const resFoods = await Guest.find(
            {
                _id: guestId, 
                'tablesDetail.tables': {
                    $elemMatch: {
                        id: foundTables[0]._id, 
                        outDate: null, 
                        outTime: null
                    }
                }
            }
        ).exec();  

        if (!resFoods) return res.status(404).send();

        // Calculate food total    
        resFoods[0].tablesDetail.tables[0].foods.forEach(async food => {
            foodTotal += (food.price * food.quantity) + food.serviceCharge + food.gstCharge;
        });

        foundTables.forEach(async table => {
            // update food total    
            const resFoodTotalUpdate = await Guest.findOneAndUpdate(
                {
                    _id: guestId, 
                    'tablesDetail.tables': {
                        $elemMatch:{
                            id: table._id, 
                            outDate: null, 
                            outTime: null
                        }
                    }
                },
                {
                    $set: {
                        'tablesDetail.tables.$.total': parseInt(foodTotal).toFixed(decimalPlace),
                        'tablesDetail.tables.$.outDate': date.format(new Date(),'YYYY-MM-DD'),
                        'tablesDetail.tables.$.outTime': date.format(new Date(),'HH:mm')
                    }
                }
            ).exec();  

            if (!resFoodTotalUpdate) return res.status(404).send();

            foodTotal = 0;
        });

        // calculate and update table total
        let tableTotal = 0;
        const resTables = await Guest.find(
            {
                _id: guestId, 
                'tablesDetail.tables': {
                    $elemMatch: {
                        outDate: { $ne : null }, 
                        outTime: { $ne : null }
                    }
                }
            }
        ).exec();  

        if (!resTables) return res.status(404).send();

        // Calculate table total    
        resTables[0].tablesDetail.tables.forEach(async table => {
            tableTotal += table.total;
        });
    
        // update food total    
        const resTableTotalUpdate = await Guest.findOneAndUpdate(
            {
                _id: guestId
            },
            {
                $set: {
                    'tablesDetail.total': parseInt(tableTotal).toFixed(decimalPlace),
                }
            }
        ).exec();  

        if (!resTableTotalUpdate) return res.status(404).send();

        // release all the tables
        const resTablesUpdate = await Table.updateMany(
            {
                hotelId, 
                guestId: guestId
            },
            {
                $set: 
                {
                    guestId: null, 
                    isOccupied: false, 
                    updatedDate: new Date()
                }
            }
        ).exec();  

        if (!resTablesUpdate) return res.status(404).send();
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