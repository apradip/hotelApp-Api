const Guest = require("../models/guests");
const Service = require("../models/services");
const GuestServiceTransaction = require("../models/guestServicesTransaction");
const date = require("date-and-time");

const decimalPlace = 2;
const serviceChargePercentage = 12.5;
const gstPercentage = 10.4;

const serviceItem = {
    id: "",
    name: "",
    quantity: 0,
    serviceChargePercentage: 0,
    serviceCharge: 0,
    gstPercentage: 0,
    gstCharge: 0,
    unitPrice: 0,
    totalPrice: 0,
    orderDate: null,
    orderTime: null,
    despatchDate: null, 
    despatchTime: null
};


// handel show all orders
//query string : hotel Id / guest Id / option: [non delivery / all]
const handelDetail = async (req, res) => {
    let serviceList = [];

    try {
        const {hotelId, guestId, option} = req.params;
        
        let foundGuestServiceList = null;

        if (option === "N") {
            foundGuestServiceList = await Guest.findOne(
                {
                    hotelId, 
                    _id: guestId, 
                    isActive: true, 
                    isEnable: true, 
                    'servicesDetail.services': {
                        $elemMatch: {
                            despatchDate: { $exists: false }, 
                            despatchTime: { $exists: false }
                        }
                    }
                }
            ).exec();        
        } else if (option === "A") {
            foundGuestServiceList = await Guest.findOne(
                {
                    hotelId, 
                    _id: guestId, 
                    isActive: true, 
                    isEnable: true, 
                    'servicesDetail.services': {
                        $elemMatch: {
                            despatchDate: { $exists: true }, 
                            despatchTime: { $exists: true }
                        }
                    }
                }
            ).exec();        
        }

        if (!foundGuestServiceList) return res.status(404).send();

        foundGuestServiceList.servicesDetail.services.forEach(async service => {
            let dataOrder = serviceItem;
            dataOrder.id = service.id;
            dataOrder.name = service.name;
            dataOrder.unitPrice = service.price;
            dataOrder.quantity = service.quantity;
            dataOrder.serviceChargePercentage = service.serviceChargePercentage;
            dataOrder.serviceCharge = service.serviceCharge;
            dataOrder.gstPercentage = service.gstPercentage;
            dataOrder.gstCharge = service.gstCharge;
            dataOrder.totalPrice = service.totalPrice;
            dataOrder.orderDate = service.orderDate;
            dataOrder.orderTime = service.orderTime;
            dataOrder.despatchDate = service.despatchDate;
            dataOrder.despatchTime = service.despatchTime;
            serviceList.push(dataOrder);   
        });
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(serviceList);
}


// handel service order
//query string : hotel Id / guest Id
//body : {"services": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;
        const {services} = req.body;

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
        services.forEach(async service => {
            if (((service.operation) === "M") || ((service.operation) === "R")) {
                const resServiceRemove = await Guest.updateOne(
                    {
                        _id: guestId, 
                         'servicesDetail.services': {
                             $elemMatch: {
                                 despatchDate: { $exists: false }, 
                                 despatchTime: { $exists: false }
                             }
                        }
                    },
                    {
                        $pull: {
                            'servicesDetail.services': { 
                                id: service.id,
                                despatchDate: { $exists: false },
                                despatchTime: { $exists: false } 
                            }
                        }
                    }
                ).exec();  
        
                if (!resServiceRemove) return res.status(404).send();
            }
        });

        // insert all add / modify operation items
        services.forEach(async service => {
            // delete all remove / modify operation items    
            if (((service.operation) === "A") || ((service.operation) === "M")) {
                // check for item existance
                const foundService = await Service.findOne(
                    {
                        hotelId, 
                        _id: service.id, 
                        isEnable: true
                    }
                ).exec();

                if (!foundService) return res.status(404).send();

                //add item in the guest
                const dataOrder = {
                    id: service.id,
                    name: foundService.name, 
                    unitPrice: parseInt(foundService.price).toFixed(decimalPlace),
                    quantity: service.quantity,
                    serviceChargePercentage: parseInt(serviceChargePercentage).toFixed(decimalPlace),
                    serviceCharge: parseInt(((foundService.price * service.quantity) * (serviceChargePercentage / 100))).toFixed(decimalPlace),
                    gstPercentage: parseInt(gstPercentage).toFixed(decimalPlace),
                    gstCharge: parseInt(((foundService.price * service.quantity) * (gstPercentage / 100))).toFixed(decimalPlace),
                    totalPrice: parseInt(parseInt(foundService.price) + 
                                parseInt(((foundService.price * service.quantity) * (serviceChargePercentage / 100))) + 
                                parseInt(((foundService.price * service.quantity) * (gstPercentage / 100)))).toFixed(decimalPlace),
                    orderDate: date.format(new Date(),'YYYY-MM-DD'),
                    orderTime: date.format(new Date(),'HH:mm')
                };

                const resOrderUpdate = await Guest.findOneAndUpdate(
                    {
                        _id: guestId
                    },
                    {
                        $push: {
                            'servicesDetail.services': dataOrder
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


// handel service delivery
//query string : hotel Id / guest Id 
//body : {"services": [{"id": ""}]}
const handelDelivery = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;
        const {services} = req.body;

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
        services.forEach(async service => {
            const resServiceDelivery = await Guest.findOneAndUpdate(
                {
                    _id: guestId, 
                    'servicesDetail.services': {
                        $elemMatch: {
                            id: service.id,
                            despatchDate: { $exists: false },
                            despatchTime: { $exists: false }
                        }
                    }
                },
                {
                    $set: {
                        'servicesDetail.services.$[es].despatchDate': date.format(new Date(),'YYYY-MM-DD'), 
                        'servicesDetail.services.$[es].despatchTime': date.format(new Date(),'HH:mm')
                    }
                },
                {
                    arrayFilters: [
                        { 'es.id': service.id }
                    ]
                }
            ).exec();  
    
            if (!resServiceDelivery) return res.status(404).send();
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

        // calculate and update service total
        let serviceTotal = 0;

        const resServices = await Guest.find(
            {
                _id: guestId, 
                'servicesDetail.services': {
                    $elemMatch: {
                        despatchDate: { $exists: true }, 
                        despatchTime: { $exists: true }
                    }
                }
            }
        ).exec();  

        if (!resServices) return res.status(404).send();
                
        resServices[0].servicesDetail.services.forEach(async service => {
            // Calculate item total    
            serviceTotal += service.totalPrice;

            // insert all services to guest service transactions
            const foundGuestServiceTransaction = await GuestServiceTransaction.findOne(
                {
                    hotelId, 
                    guestId, 
                    serviceId: service.id,
                    orderDate: service.orderDate,
                    orderTime: service.orderTime,
                    despatchDate: service.despatchDate,
                    despatchTime: service.despatchTime
                }
            ).exec();

            if (!foundGuestServiceTransaction) {
                const data = new GuestServiceTransaction({
                    hotelId,
                    guestId,
                    serviceId: service.id,
                    name: service.name, 
                    quantity: service.quantity,
                    unitPrice: service.unitPrice,
                    serviceChargePercentage: service.serviceChargePercentage,
                    serviceCharge: service.serviceCharge,
                    gstPercentage: service.gstPercentage,
                    gstCharge: service.gstCharge,
                    totalPrice: service.totalPrice,
                    orderDate: service.orderDate,
                    orderTime: service.orderTime,
                    despatchDate: service.despatchDate,
                    despatchTime: service.despatchTime
                });

                const resAdd = await data.save();
                if (!resAdd) return res.status(400).send();
            }
        });

        // update service total    
        const resServiceTotalUpdate = await Guest.findOneAndUpdate(
            {
                _id: guestId, 
            },
            {
                $set: {
                    'servicesDetail.total': parseInt(serviceTotal).toFixed(decimalPlace)
                }
            }
        ).exec();  

        if (!resServiceTotalUpdate) return res.status(404).send();
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