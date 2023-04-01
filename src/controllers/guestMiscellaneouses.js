const Guest = require("../models/guests");
const Miscellaneous = require("../models/miscellaneouses");
const GuestMiscellaneousTransaction = require("../models/guestMiscellaneousesTransaction");
const date = require("date-and-time");

const decimalPlace = 2;
const serviceChargePercentage = 12.5;
const gstPercentage = 10.4;

const miscellaneousItem = {
    id: "",
    name: "",
    unitPrice: 0,
    quantity: 0,
    serviceChargePercentage: 0,
    serviceCharge: 0,
    gstPercentage: 0,
    gstCharge: 0,
    totalPrice: 0,
    orderDate: null,
    orderTime: null,
    despatchDate: null, 
    despatchTime: null
};


// handel show all orders
//query string : hotel Id / guest Id / option: [non delivery / all]
const handelDetail = async (req, res) => {
    let miscellaneousList = [];

    try {
        const {hotelId, guestId, option} = req.params;
        
        let foundGuestMiscellaneousList = null;

        if (option === "N") {
            foundGuestMiscellaneousList = await Guest.findOne(
                {
                    hotelId, 
                    _id: guestId, 
                    isActive: true, 
                    isEnable: true, 
                    'miscellaneousesDetail.miscellaneouses': {
                        $elemMatch: {
                            despatchDate: { $exists: false }, 
                            despatchTime: { $exists: false }
                        }
                    }
                }
            ).exec();        
        } else if (option === "A") {
            foundGuestMiscellaneousList = await Guest.findOne(
                {
                    hotelId, 
                    _id: guestId, 
                    isActive: true, 
                    isEnable: true, 
                    'miscellaneousesDetail.miscellaneouses': {
                        $elemMatch: {
                            despatchDate: { $exists: true }, 
                            despatchTime: { $exists: true }
                        }
                    }
                }
            ).exec();        
        }

        if (!foundGuestMiscellaneousList) return res.status(404).send();

        foundGuestMiscellaneousList.miscellaneousesDetail.miscellaneouses.forEach(async miscellaneous => {
            let dataOrder = miscellaneousItem;
            dataOrder.id = miscellaneous.id;
            dataOrder.name = miscellaneous.name;
            dataOrder.unitPrice = miscellaneous.price;
            dataOrder.quantity = miscellaneous.quantity;
            dataOrder.serviceChargePercentage = miscellaneous.serviceChargePercentage;
            dataOrder.serviceCharge = miscellaneous.serviceCharge;
            dataOrder.gstPercentage = miscellaneous.gstPercentage;
            dataOrder.gstCharge = miscellaneous.gstCharge;
            dataOrder.totalPrice = miscellaneous.totalPrice;
            dataOrder.orderDate = miscellaneous.orderDate;
            dataOrder.orderTime = miscellaneous.orderTime;
            dataOrder.despatchDate = miscellaneous.despatchDate;
            dataOrder.despatchTime = miscellaneous.despatchTime;
            miscellaneousList.push(dataOrder);   
        });
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(miscellaneousList);
}


// handel miscellaneous order
//query string : hotel Id / guest Id
//body : {"miscellaneouses": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;
        const {miscellaneouses} = req.body;

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
        
        // delete all remove / modify operation items    
        miscellaneouses.forEach(async miscellaneous => {
            if (((miscellaneous.operation) === "M") || ((miscellaneous.operation) === "R")) {
                const resMiscellaneousRemove = await Guest.updateOne(
                    {
                        _id: guestId, 
                         'miscellaneousesDetail.miscellaneouses': {
                             $elemMatch: {
                                 despatchDate: { $exists: false }, 
                                 despatchTime: { $exists: false }
                             }
                        }
                    },
                    {
                        $pull: {
                            'miscellaneousesDetail.miscellaneouses': { 
                                id: miscellaneous.id,
                                despatchDate: { $exists: false },
                                despatchTime: { $exists: false } 
                            }
                        }
                    }
                ).exec();  
        
                if (!resMiscellaneousRemove) return res.status(404).send();
            }
        });

        // insert all add / modify operation items
        miscellaneouses.forEach(async miscellaneous => {
            // delete all remove / modify operation miscellaneouses    
            if (((miscellaneous.operation) === "A") || ((miscellaneous.operation) === "M")) {
                // check for item existance
                const foundMiscellaneous = await Miscellaneous.findOne(
                    {
                        hotelId, 
                        _id: miscellaneous.id, 
                        isEnable: true
                    }
                ).exec();

                if (!foundMiscellaneous) return res.status(404).send();

                //add item in the guest
                const dataOrder = {
                    id: miscellaneous.id,
                    name: foundMiscellaneous.name, 
                    unitPrice: parseInt(foundMiscellaneous.price).toFixed(decimalPlace),
                    quantity: miscellaneous.quantity,
                    serviceChargePercentage: parseInt(serviceChargePercentage).toFixed(decimalPlace),
                    serviceCharge: parseInt(((foundMiscellaneous.price * miscellaneous.quantity) * (serviceChargePercentage / 100))).toFixed(decimalPlace),
                    gstPercentage: parseInt(gstPercentage).toFixed(decimalPlace),
                    gstCharge: parseInt(((foundMiscellaneous.price * miscellaneous.quantity) * (gstPercentage / 100))).toFixed(decimalPlace),
                    totalPrice: parseInt(parseInt(foundMiscellaneous.price * miscellaneous.quantity) + 
                                        parseInt(((foundMiscellaneous.price * miscellaneous.quantity) * (serviceChargePercentage / 100))) + 
                                        parseInt(((foundMiscellaneous.price * miscellaneous.quantity) * (gstPercentage / 100)))).toFixed(decimalPlace),
                    orderDate: date.format(new Date(),'YYYY-MM-DD'),
                    orderTime: date.format(new Date(),'HH:mm')
                };

                const resOrderUpdate = await Guest.findOneAndUpdate(
                    {
                        _id: guestId
                    },
                    {
                        $push: {
                            'miscellaneousesDetail.miscellaneouses': dataOrder
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


// handel miscellaneous delivery
//query string : hotel Id / guest Id 
//body : {"miscellaneouses": [{"id": ""}]}
const handelDelivery = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;
        const {miscellaneouses} = req.body;

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

        // update all delivery date & time
        miscellaneouses.forEach(async miscellaneous => {
            const resMiscellaneousDelivery = await Guest.findOneAndUpdate(
                {
                    _id: guestId, 
                    'miscellaneousesDetail.miscellaneouses': {
                        $elemMatch: {
                            id: miscellaneous.id,
                            despatchDate: { $exists: false },
                            despatchTime: { $exists: false }
                        }
                    }
                },
                {
                    $set: {
                        'miscellaneousesDetail.miscellaneouses.$[ei].despatchDate': date.format(new Date(),'YYYY-MM-DD'), 
                        'miscellaneousesDetail.miscellaneouses.$[ei].despatchTime': date.format(new Date(),'HH:mm')
                    }
                },
                {
                    arrayFilters: [
                        { 'ei.id': miscellaneous.id }
                    ]
                }
            ).exec();  
    
            if (!resMiscellaneousDelivery) return res.status(404).send();
        });
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
}


// handle guest checkout 
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

        // calculate and update miscellaneous total
        let miscellaneousTotal = 0;

        const resMiscellaneouses = await Guest.find(
            {
                _id: guestId, 
                'miscellaneousesDetail.miscellaneouses': {
                    $elemMatch: {
                        despatchDate: { $exists: true }, 
                        despatchTime: { $exists: true }
                    }
                }
            }
        ).exec();  

        if (!resMiscellaneouses) return res.status(404).send();
        
        resMiscellaneouses[0].miscellaneousesDetail.miscellaneouses.forEach(async miscellaneous => {
            // Calculate miscellaneous total    
            miscellaneousTotal += miscellaneous.totalPrice;

            // insert all miscellaneouses to guest miscellaneous transactions
            const foundGuestMiscellaneousTransaction = await GuestMiscellaneousTransaction.findOne(
                {
                    hotelId, 
                    guestId, 
                    miscellaneousId: miscellaneous.id,
                    orderDate: miscellaneous.orderDate,
                    orderTime: miscellaneous.orderTime,
                    despatchDate: miscellaneous.despatchDate,
                    despatchTime: miscellaneous.despatchTime
                }
            ).exec();

            if (!foundGuestMiscellaneousTransaction) {
                const data = new GuestMiscellaneousTransaction({
                    hotelId,
                    guestId,
                    miscellaneousId: miscellaneous.id,
                    name: miscellaneous.name, 
                    quantity: miscellaneous.quantity,
                    unitPrice: miscellaneous.unitPrice,
                    serviceChargePercentage: miscellaneous.serviceChargePercentage,
                    serviceCharge: miscellaneous.serviceCharge,
                    gstPercentage: miscellaneous.gstPercentage,
                    gstCharge: miscellaneous.gstCharge,
                    totalPrice: miscellaneous.totalPrice,
                    orderDate: miscellaneous.orderDate,
                    orderTime: miscellaneous.orderTime,
                    despatchDate: miscellaneous.despatchDate,
                    despatchTime: miscellaneous.despatchTime
                });

                const resAdd = await data.save();
                if (!resAdd) return res.status(400).send();
            }
        });

        // update miscellaneous total    
        const resMiscellaneousTotalUpdate = await Guest.findOneAndUpdate(
            {
                _id: guestId, 
            },
            {
                $set: {
                    'miscellaneousesDetail.total': parseInt(miscellaneousTotal).toFixed(decimalPlace)
                }
            }
        ).exec();  

        if (!resMiscellaneousTotalUpdate) return res.status(404).send();
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
}


module.exports = {
    handelDetail,
    handelOrder,
    handelDelivery,
    handelCheckout
}