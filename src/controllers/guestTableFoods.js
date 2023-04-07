const mongoose = require("mongoose");
const Guest = require("../models/guests");
const Table = require("../models/tables");
const Food = require("../models/foods");
const getHotelDetail = require("./hotels");
const date = require("date-and-time");

const foodItem = {
    id: "",
    name: "",
    quantity: 0,
    serviceChargePercentage: 0,
    serviceCharge: 0,
    gstPercentage: 0,
    gstCharge: 0,
    price: 0,
    orderDate: null,
    orderTime: null,
};


//handel add guest table
//query string : hotel Id / guest Id
//body : {"tables": [{"id": ""}]}
const handelTableBooking = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;
        const {tables} = req.body;
        
        const filter = {
            _id: guestId, 
            hotelId, 
            isActive: true, 
            isEnable: true
        };

        await Guest.findOne(filter)  
        .exec((err, guest) => {
            if (err) return res.status(500).send(err);
            if (!guest) return res.status(404).send("Guest not found!");


            tables.forEach(async paramTable => {

                // check if the table is empty
                const filter = {
                    _id: paramTable.id, 
                    hotelId: hotelId, 
                    isOccupied: false, 
                    isEnable: true
                };
                await Table.findOne(filter)
                .exec(async (err, table) => {
                    if (err) return res.status(500).send(err);
                    if (!table) return res.status(404).send("Table not found!");


                    //add table in the guest
                    const data = {
                        id: table._id,
                        no: table.no, 
                        inDate: date.format(new Date(),'YYYY-MM-DD'),
                        inTime: date.format(new Date(),'HH:mm')
                    };
                    const filterGuest = {_id: guest._id};

                    const updateGuest = {$push: {'tablesDetail.tables': data}};
                    await Guest.updateOne(filterGuest, updateGuest)  
                    .exec(async (err) => {
                        if (err) return res.status(500).send(err);
                    });


                    // change table occupancy status
                    const filterTable = {
                        _id: table._id,
                        hotelId
                    };
                    const updateTable = {
                        guestId: guest._id, 
                        isOccupied: true, 
                        updatedDate: new Date()
                    };

                    await Table.updateOne(filterTable, updateTable)
                    .exec(async (err) => {
                        if (err) return res.status(500).send(err);
                    });

                });

            });

        });
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send("Guest table alloted sucessfully.");
}


// handel food order
//query string : hotel Id / guest Id
//body : {"foods": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;
        const {foods} = req.body;

        const hotel = await getHotelDetail(hotelId);

        // get guest
        const filterGuest = {
            _id: guestId, 
            hotelId, 
            isActive: true, 
            isEnable: true
        };

        await Guest.findOne(filterGuest)
        .exec(async (err, guest) => {
            if (err) return res.status(500).send(err);
            if (!guest) return res.status(404).send("Guest not found!");


            // get table
            const filterTable = {
                hotelId, 
                guestId: guest._id, 
                isOccupied: true, 
                isEnable: true
            };
            
            await Table.findOne(filterTable)
            .exec(async (err, table) => {
                if (err) return res.status(500).send(err);
                if (!table) return res.status(404).send("No table assigned to the guest!");


                // delete all remove / modify operation foods    
                foods.forEach(async food => {

                    if (((food.operation) === "M") || ((food.operation) === "R")) {
                        const filterDelete = {
                            _id: guest._id, 
                            'tablesDetail.tables': {
                                $elemMatch: {
                                    id: table._id, 
                                    outDate: { $exists: false }, 
                                    outTime: { $exists: false }
                                }
                            }, 
                            'tablesDetail.tables.$.foods': {
                                $elemMatch: {
                                    despatchDate: { $exists: false }, 
                                    despatchTime: { $exists: false }
                                }
                            }
                        };
                        const updateDelete = {
                            $pull: {
                                'tablesDetail.tables.$.foods': { 
                                    id: food.id,
                                    despatchDate: { $exists: false }
                                }
                            }
                        };

                        await Guest.updateOne(filterDelete, updateDelete)
                        .exec(async (err) => {
                            if (err) return res.status(404).send(err);
                        });
                    }
                });


                // insert all add / modify operation foods
                foods.forEach(async food => {

                    // delete all remove / modify operation foods    
                    if (((food.operation) === "A") || ((food.operation) === "M")) {
                        
                        // check for food existance
                        const filterFood = {
                            hotelId, 
                            _id: food.id, 
                            isEnable: true
                        };

                        await Food.findOne(filterFood)
                        .exec(async (err, foodDetail) => {
                            if (err) return res.status(500).send(err);
                            if (!foodDetail) return res.status(404).send("Ordered food not found!");


                            //add food in the guest table
                            const dataOrder = {
                                id: foodDetail._id,
                                name: foodDetail.name, 
                                price: parseInt(foodDetail.price).toFixed(hotel.fincialDecimalPlace),
                                quantity: food.quantity,
                                serviceChargePercentage: parseInt(hotel.serviceChargePercentage).toFixed(hotel.fincialDecimalPlace),
                                serviceCharge: parseInt(((foodDetail.price * food.quantity) * (hotel.serviceChargePercentage / 100))).toFixed(hotel.fincialDecimalPlace),
                                gstPercentage: hotel.foodGstPercentage,
                                gstCharge: parseInt(((foodDetail.price * food.quantity) * (hotel.foodGstPercentage / 100))).toFixed(hotel.fincialDecimalPlace),
                                orderDate: date.format(new Date(),'YYYY-MM-DD'),
                                orderTime: date.format(new Date(),'HH:mm')
                            };
                            const filterInsert = {
                                _id: guest._id, 
                                'tablesDetail.tables': {
                                    $elemMatch:{
                                        id: table._id, 
                                        outDate: { $exists: false }, 
                                        outTime: { $exists: false }
                                    }
                                }
                            };
                            const updateInsert = {
                                $push: {
                                    'tablesDetail.tables.$.foods': dataOrder
                                }
                            };

                            await Guest.updateOne(filterInsert, updateInsert)
                            .exec(async (err) => {
                                if (err) return res.status(500).send(err);
                            });

                        });

                    }

                });

            });

        });
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send("Order successfully accepted.");
}


// handel show all orders
//query string : hotel Id / guest Id / option: [non checkout / all]
const handelDetail = async (req, res) => {
    let foodList = [];
    
    try {
        const {hotelId, guestId, option} = req.params;

        if (option === "N") {

            const filter = {
                hotelId, 
                _id: guestId, 
                isActive: true, 
                isEnable: true, 
                'tablesDetail.tables': {
                    $elemMatch: {
                        outDate: { $exists: false }, 
                        outTime: { $exists: false }
                    }
                }
            };

            await Guest.findOne(filter)
            .exec((err, data) => {
                if (err) return res.status(500).send(err);
                if (!data) return res.status(404).send("No food found.");

                if (data) {
                    
                    data.tablesDetail.tables.forEach(async table => {

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

                }

            });

        } else if (option === "A") {
            // const guest_Id = mongoose.Types.ObjectId (guestId);

            const filter = {
                    hotelId, 
                    _id: guestId, 
                    isActive: true, 
                    isEnable: true, 
                    'tablesDetail.tables': {
                        $elemMatch: {
                            outDate: { $exists: true }, 
                            outTime: { $exists: true }
                        }
                    }
            };

            await Guest.findOne(filter)
            .exec((err, data) => {
                if (err) return res.status(500).send(err);
                if (!data) return res.status(404).send("No food found.");

                if (data) {
                    data.tablesDetail.tables.forEach(async table => {
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

                }

            });

        }
    } catch(e) {
        return res.status(500).send(e);
    }        
    
    return res.status(200).send(foodList);
}


// handel food delivery
//query string : hotel Id / guest Id
//body : {"foods": [{"id": ""}]}
const handelDelivery = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;
        const {foods} = req.body;

        // get guest
        const filterGuest = {
            hotelId, 
            _id: guestId, 
            isActive: true, 
            isEnable: true
        };

        await Guest.findOne(filterGuest)
        .exec(async (err, guest) => {
            if (err) return res.status(500).send(err);
            if (!guest) return res.status(404).send("Guest not found!");


            // get table
            const filterTable = {
                hotelId, 
                guestId: guest._id, 
                isOccupied: true, 
                isEnable: true
            };

            await Table.findOne(filterTable)
            .exec((err, table) => {
                if (err) return res.status(500).send(err);
                if (!table) return res.status(404).send("Table not assigned to the guest!");


                // update all delivery date & time
                foods.forEach(async food => {
                    const filter = {
                        _id: guest._id, 
                        'tablesDetail.tables': {
                            $elemMatch: {
                                id: table._id, 
                                outDate: { $exists: false }, 
                                outTime: { $exists: false }
                            }
                        }, 
                        'tablesDetail.tables.foods': {
                            $elemMatch: {
                                id: food.id,
                                despatchDate: { $exists: false },
                                despatchTime: { $exists: false }
                            }
                        }
                    };
                    const update = {
                        $set: {
                            'tablesDetail.tables.$[et].foods.$[ef].despatchDate': date.format(new Date(),'YYYY-MM-DD'), 
                            'tablesDetail.tables.$[et].foods.$[ef].despatchTime': date.format(new Date(),'HH:mm')
                        }
                    };
                    const arrayFilter = {
                        arrayFilters: [
                            { 'et.id': table._id },
                            { 'ef.id': food.id }
                        ]
                    };

                    await Guest.updateOne(filter, update, arrayFilter)
                    .exec((err) => {
                        if (err) return res.status(500).send(err);
                    });
                });

            });

        });
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send("Order delivered successfully.");
}


// handle table checkout 
//query string : hotel Id / guest Id
const handelCheckout = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;

        const hotel = await getHotelDetail(hotelId);

        // get guest
        const filterGuest = {
            hotelId, 
            _id: guestId, 
            isActive: true, 
            isEnable: true
        };

        await Guest.findOne(filterGuest)
        .exec(async (err, guest) => {
            if (err) return res.status(500).send(err);
            if (!guest) return res.status(404).send("Guest not found!");

            // get tables
            const filterTable = {
                hotelId, 
                guestId: guest._id, 
                isOccupied: true, 
                isEnable: true
            };

            await Table.find(filterTable)
            .exec(async (err, tables) => {
                if (err) return res.status(500).send(err);
                if (!tables) return res.status(404).send("Table not found!");

                // calculate and update table food total
                tables.forEach(async table => {

                    const filterNonCheckoutTable = {
                        _id: guestId, 
                    };

                    await Guest.findOne(filterNonCheckoutTable)
                    .exec(async (err, nonCheckoutTable) => {
                        if (err) return res.status(500).send(err);

                        if (nonCheckoutTable) {

                            // Calculate food total    
                            nonCheckoutTable.tablesDetail.tables.forEach(async nonCheckTableItem => {

                                if ((nonCheckTableItem.id == table._id) && (typeof(nonCheckTableItem.outDate) == "undefined")) {

                                    let foodTotal = 0;

                                    nonCheckTableItem.foods.forEach(async food => {
                                        foodTotal += (food.price * food.quantity) + food.serviceCharge + food.gstCharge;
                                    });

                                    // update all tables food total    
                                    const filterTotal = {
                                        _id: guestId, 
                                        'tablesDetail.tables': {
                                            $elemMatch:{
                                                id: nonCheckTableItem.id, 
                                                outDate: { $exists: false }, 
                                                outTime: { $exists: false }
                                            }
                                        }
                                    };
                                    const updateTotal = {
                                        $set: {
                                            'tablesDetail.tables.$.total': parseInt(foodTotal).toFixed(hotel.fincialDecimalPlace),
                                            'tablesDetail.tables.$.outDate': date.format(new Date(),'YYYY-MM-DD'),
                                            'tablesDetail.tables.$.outTime': date.format(new Date(),'HH:mm')
                                        }
                                    };

                                    await Guest.updateOne(filterTotal, updateTotal)
                                    .exec((err) => {
                                        if (err) return res.status(500).send(err);
                                    });

                                }
                            });

                        }
                        
                    });

                });

            });


            // calculate and update table total
            const filterCheckoutTables = {
                _id: guest._id, 
            //     'tablesDetail.tables': {
            //         $elemMatch: {
            //             outDate: { $exists: true }, 
            //             outTime: { $exists: true }
            //         }
            //     }
            };

            await Guest.findOne(filterCheckoutTables)
            .exec(async (err, checkoutTables) => {
                if (err) return res.status(500).send(err);

                if (checkoutTables) {

                    // Calculate table total    
                    let tableTotal = 0;

                    checkoutTables.tablesDetail.tables.forEach(async checkTableItem => {
                        tableTotal += checkTableItem.total;
                    });

                    // update food total
                    const filterTableTotal = {
                        _id: guest._id,
                        hotelId
                    };
                    const updateTableTotal = {
                        $set: {
                            'tablesDetail.total': parseInt(tableTotal).toFixed(hotel.fincialDecimalPlace),
                        }
                    };

                    await Guest.findOneAndUpdate(filterTableTotal, updateTableTotal)
                    .exec((err, updateTotal) => {
                        if (err) return res.status(500).send(err);
                        if (!updateTotal) return res.status(404).send("Guest table total not updated!");
                    });
                    
                }

            });


            // release all the tables
            const filterOccupiedTable = {
                hotelId, 
                guestId: guest._id
            };
            const updateOccupiedTable = {
                $set: 
                {
                    guestId: null, 
                    isOccupied: false, 
                    updatedDate: new Date()
                }
            };

            await Table.updateMany(filterOccupiedTable, updateOccupiedTable)
            .exec((err, updateStatus) => {
                if (err) return res.status(500).send(err);
                if (!updateStatus) return res.status(404).send("No table found for realised!");
            });

        });

    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send("Table checkedout successfully.");
}


module.exports = {
    handelTableBooking,
    handelDetail,
    handelOrder,
    handelDelivery,
    handelCheckout
}