const Guest = require("../models/guests");
const Item = require("../models/items");
const date = require("date-and-time");

const decimalPlace = 2;
const serviceChargePercentage = 12.5;
const gstPercentage = 10.4;

const itemItem = {
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
    despatchDate: null, 
    despatchTime: null
};

// handel show all orders
//query string : hotel Id / guest Id / option: [non delivery / all]
const handelDetail = async (req, res) => {
    let itemList = [];

    try {
        const {hotelId, guestId, option} = req.params;
        
        let foundGuestItemList = null;

        if (option === "N") {
            foundGuestItemList = await Guest.findOne(
                {
                    hotelId, 
                    _id: guestId, 
                    isActive: true, 
                    isEnable: true, 
                    'itemsDetail.items': {
                        $elemMatch: {
                            despatchDate: { $exists: false }, 
                            despatchTime: { $exists: false }
                        }
                    }
                }
            ).exec();        
        } else if (option === "A") {
            foundGuestItemList = await Guest.findOne(
                {
                    hotelId, 
                    _id: guestId, 
                    isActive: true, 
                    isEnable: true, 
                    'itemsDetail.items': {
                        $elemMatch: {
                            despatchDate: { $exists: true }, 
                            despatchTime: { $exists: true }
                        }
                    }
                }
            ).exec();        
        }

        if (!foundGuestItemList) return res.status(404).send();

        foundGuestItemList.itemsDetail.items.forEach(async item => {
            let dataOrder = itemItem;
            dataOrder.id = item.id;
            dataOrder.name = item.name;
            dataOrder.price = item.price;
            dataOrder.quantity = item.quantity;
            dataOrder.serviceChargePercentage = item.serviceChargePercentage;
            dataOrder.serviceCharge = item.serviceCharge;
            dataOrder.gstPercentage = item.gstPercentage;
            dataOrder.gstCharge = item.gstCharge;
            dataOrder.orderDate = item.orderDate;
            dataOrder.orderTime = item.orderTime;
            dataOrder.despatchDate = item.despatchDate;
            dataOrder.despatchTime = item.despatchTime;
            itemList.push(dataOrder);   
        });
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(itemList);
}

// handel item order
//query string : hotel Id / guest Id
//body : {"items": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;
        const {items} = req.body;

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
        items.forEach(async item => {
            if (((item.operation) === "M") || ((item.operation) === "R")) {
                const resItemRemove = await Guest.updateOne(
                    {
                        _id: guestId, 
                         'itemsDetail.items': {
                             $elemMatch: {
                                 despatchDate: { $exists: false }, 
                                 despatchTime: { $exists: false }
                             }
                        }
                    },
                    {
                        $pull: {
                            'itemsDetail.items': { 
                                id: item.id,
                                despatchDate: { $exists: false },
                                despatchTime: { $exists: false } 
                            }
                        }
                    }
                ).exec();  
        
                if (!resItemRemove) return res.status(404).send();
            }
        });

        // insert all add / modify operation items
        items.forEach(async item => {
            // delete all remove / modify operation items    
            if (((item.operation) === "A") || ((item.operation) === "M")) {
                // check for item existance
                const foundItem = await Item.findOne(
                    {
                        hotelId, 
                        _id: item.id, 
                        isEnable: true
                    }
                ).exec();

                if (!foundItem) return res.status(404).send();

                //add item in the guest
                const dataOrder = {
                    id: item.id,
                    name: foundItem.name, 
                    price: parseInt(foundItem.price).toFixed(decimalPlace),
                    quantity: item.quantity,
                    serviceChargePercentage: parseInt(serviceChargePercentage).toFixed(decimalPlace),
                    serviceCharge: parseInt(((foundItem.price * item.quantity) * (serviceChargePercentage / 100))).toFixed(decimalPlace),
                    gstPercentage: parseInt(gstPercentage).toFixed(decimalPlace),
                    gstCharge: parseInt(((foundItem.price * item.quantity) * (gstPercentage / 100))).toFixed(decimalPlace),
                    orderDate: date.format(new Date(),'YYYY-MM-DD'),
                    orderTime: date.format(new Date(),'HH:mm')
                };

                const resOrderUpdate = await Guest.findOneAndUpdate(
                    {
                        _id: guestId
                    },
                    {
                        $push: {
                            'itemsDetail.items': dataOrder
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


// handel item delivery
//query string : hotel Id / guest Id 
//body : {"items": [{"id": ""}]}
const handelDelivery = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;
        const {items} = req.body;

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
        items.forEach(async item => {
            const resItemDelivery = await Guest.findOneAndUpdate(
                {
                    _id: guestId, 
                    'itemsDetail.items': {
                        $elemMatch: {
                            id: item.id,
                            despatchDate: { $exists: false },
                            despatchTime: { $exists: false }
                        }
                    }
                },
                {
                    $set: {
                        'itemsDetail.items.$[ei].despatchDate': date.format(new Date(),'YYYY-MM-DD'), 
                        'itemsDetail.items.$[ei].despatchTime': date.format(new Date(),'HH:mm')
                    }
                },
                {
                    arrayFilters: [
                        { 'ei.id': item.id }
                    ]
                }
            ).exec();  
    
            if (!resItemDelivery) return res.status(404).send();
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

        // calculate and update item total
        let itemTotal = 0;

        const resItems = await Guest.find(
            {
                _id: guestId, 
                'itemsDetail.items': {
                    $elemMatch: {
                        despatchDate: { $exists: true }, 
                        despatchTime: { $exists: true }
                    }
                }
            }
        ).exec();  

        if (!resItems) return res.status(404).send();
        // Calculate item total    
        resItems[0].itemsDetail.items.forEach(async item => {
            itemTotal += (item.price * item.quantity) + item.serviceCharge + item.gstCharge;
        });

        // update item total    
        const resItemTotalUpdate = await Guest.findOneAndUpdate(
            {
                _id: guestId, 
            },
            {
                $set: {
                    'itemsDetail.total': parseInt(itemTotal).toFixed(decimalPlace)
                }
            }
        ).exec();  

        if (!resItemTotalUpdate) return res.status(404).send();
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