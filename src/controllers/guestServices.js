const mongoose = require('mongoose');
const Hotel = require('./hotels');
const Guest = require('../models/guests');
const Services = require('../models/services');
const GuestServiceTransaction = require('../models/guestServicesTransaction');
const date = require('date-and-time');

class serviceType {
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

class serviceTransactionType {
    constructor(services, orderDate, orderTime) {
        this.services = services,
        this.orderDate = orderDate;
        this.orderTime = orderTime;
    }
};

class expenseTransactionType {
    constructor(expenseId, expenseAmount) {
        this.type = "S",
        this.expenseId = expenseId,
        this.expenseAmount = expenseAmount,
        this.narration = 'Expense for the service items.'
    }
}


// handel show all orders
//query string : hotel Id / guest Id / option: [non delivery / all]
const handelDetail = async (req, res) => {
    let serviceList = [];

    try {
        const { hotelId, guestId, option } = req.params;
        let foundGuestServiceList = null;

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
                $unwind: '$servicesDetail'
            };
            const filter3 = {
                $match: {
                    'servicesDetail.despatchDate': { $exists: false },
                    'servicesDetail.despatchTime': { $exists: false }
                }
            };
            const filter4 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0, updatedDate: 0
    
                }
            };
            const filter5 = { 
                $unwind: '$servicesDetail.services' 
            };  
            const pipeline = [filter1, filter2, filter3, filter4, filter5];
            foundGuestServicesList = await Guest.aggregate(pipeline);  

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
                $unwind: '$servicesDetail'
            };
            const filter3 = {
                $match: {
                    'servicesDetail.despatchDate': { $exists: true },
                    'servicesDetail.despatchTime': { $exists: true }
                }
            };
            const filter4 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0, updatedDate: 0
    
                }
            };
            const filter5 = { 
                $unwind: '$servicesDetail.services' 
            };  
            const pipeline = [filter1, filter2, filter3, filter4, filter5];
            foundGuestServiceList = await Guest.aggregate(pipeline);  

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
                $unwind: '$servicesDetail'
            };
            const filter3 = {
                $match: {
                    'servicesDetail._id': mongoose.Types.ObjectId(option),
                }
            };
            const filter4 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0, updatedDate: 0
                }
            };
            const filter5 = { 
                $unwind: '$servicesDetail.services' 
            };  
            const pipeline = [filter1, filter2, filter3, filter4, filter5];
            foundGuestServiceList = await Guest.aggregate(pipeline);  
    
            if (!foundGuestServiceList) return res.status(404).send();
        }

        if (!foundGuestServiceList) return res.status(404).send();

        foundGuestServiceList.forEach(async servicesDetail => {
            const service = servicesDetail.servcesDetail.services;
            
            const dataOrder = {
                id: service.id,
                name: service.name,
                unitPrice: service.price,
                quantity: service.quantity,
                serviceChargePercentage: service.serviceChargePercentage,
                serviceCharge: service.serviceCharge,
                gstPercentage: service.gstPercentage,
                gstCharge: service.gstCharge,
                totalPrice: service.totalPrice,
                orderDate: service.orderDate,
                orderTime: service.orderTime,
                despatchDate: service.despatchDate,
                despatchTime: service.despatchTime
            };

            serviceList.push(dataOrder);   
        });
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(serviceList);
}



// handel order
//query string : hotel Id / guest Id
//body : {"transactionId": "", "services": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    try {
        const { hotelId, guestId } = req.params;
        const { transactionId, services } = req.body;

        let servicesDb = undefined;
        
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
                    $unwind: '$servcesDetail'
                };
                const filter3 = {
                    $match: {
                        'servicesDetail._id': mongoose.Types.ObjectId(transactionId)
                    }
                };
                const filter4 = {
                    $project: {
                        _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                        corporateName: 0, corporateAddress: 0, gstNo: 0,
                        roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                        expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                        option: 0, isActive: 0, isEnable: 0, updatedDate: 0
                    }
                };
                const pipelineSum = [filter1, filter2, filter3, filter4];
                const resServicesDetail = await Guest.aggregate(pipelineSum);  
                if (!resServicesDetail) return res.status(404).send();
                
                servicesDb = resServicesDetail[0].servicesDetail.services;

                for (const service of services) {        
                    if (((service.operation) === "M") || ((service.operation) === "R")) {
                        const keyToFind = "id";
                        const valueToFind = service.id;
                        servicesDb = servicesDb.filter(obj => obj[keyToFind] !== valueToFind);
                    }
                }

                for (const service of services) {       
                    if (((service.operation) === "A") || ((service.operation) === "M")) {
                        
                        // check for item existance
                        const foundService = await Services.findOne(
                            {
                                _id: mongoose.Types.ObjectId(service.id), 
                                hotelId: hotel._id, 
                                isEnable: true
                            }
                        );    
        
                        if (foundService) {
                            servicesDb.push(new serviceType(
                                foundService._id, 
                                foundService.name, 
                                parseInt(foundService.price).toFixed(hotel.fincialDecimalPlace),
                                parseInt(service.quantity),
                                parseInt(hotel.serviceChargePercentage).toFixed(hotel.fincialDecimalPlace),
                                parseInt(hotel.foodGstPercentage).toFixed(hotel.fincialDecimalPlace)
                            ));
                        }
                    }
                }

                const resServiceUpdate = await Guest.updateOne(
                    {
                        _id: mongoose.Types.ObjectId(guestId), 
                        hotelId,
                        isActive: true,
                        isEnable: true
                    },
                    {
                        $set: {
                            'servicesDetail.$[ed].services': servicesDb
                        }
                    },
                    { 
                        arrayFilters: [{
                            'ed._id': mongoose.Types.ObjectId(transactionId)
                        }]           
                    }
                );  
                if (!resServiceUpdate) return res.status(404).send();

            } else {
                
                servicesDb = await newServiceValues(hotel, services);
            }
        } else {
            servicesDb = await newServiceValues(hotel, services);

            const resServiceUpdate = await Guest.updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId), 
                    hotelId,
                    isActive: true,
                    isEnable: true
                },
                {
                    $push: {
                        servicesDetail: servicesDb
                    }
                },
            );  
            if (!resServiceUpdate) return res.status(404).send();

        }

        return res.status(200).send();
    } catch(e) {
        return res.status(500).send(e);
    }
}

async function newServiceValues(hotel, services) {
    // insert all add / modify operation items
    const transaction = new serviceTransactionType(
        [], 
        date.format(new Date(),'YYYY-MM-DD'), 
        date.format(new Date(),'HH:mm'));

    for (const service of services) {       
            
        // delete all remove / modify operation service    
        if ((service.operation) === "A") {
            
            // check for item existance
            const foundService = await Services.findOne(
                {
                    _id: mongoose.Types.ObjectId(service.id), 
                    hotelId: hotel._id, 
                    isEnable: true
                }
            );    

            if (foundService) {
                transaction.services.push(new serviceType(
                    service.id, 
                    foundService.name, 
                    parseInt(foundService.price).toFixed(hotel.fincialDecimalPlace),
                    parseInt(service.quantity),
                    parseInt(hotel.serviceChargePercentage).toFixed(hotel.fincialDecimalPlace),
                    parseInt(hotel.foodGstPercentage).toFixed(hotel.fincialDecimalPlace)
                ));
            }
        }
    }

    return transaction;
}


// handel delivery
//query string : hotel Id / guest Id / transaction Id
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
                    'servicesDetail.$[ele].despatchDate': date.format(new Date(),'YYYY-MM-DD'), 
                    'servicesDetail.$[ele].despatchTime': date.format(new Date(),'HH:mm')
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


// handle guest checkout 
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
            $unwind: '$servicesDetail'
        };
        const filter3 = {
            $match: {
                'servicesDetail._id': mongoose.Types.ObjectId(transactionId)
            }
        };
        const filter4 = {
            $project: {
                _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                corporateName: 0, corporateAddress: 0, gstNo: 0, 
                roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                expensesPaymentsDetail: 0, balance: 0, inDate: 0, inTime: 0,
                option: 0, isActive: 0, isEnable: 0, updatedDate: 0
            }
        };
        const filter5 = { 
            $unwind: '$servicesDetail.services' 
        };  
        const filter6 = {
            $group: {
              _id: null,
              total: { $sum: '$servicesDetail.services.totalPrice' }
            }
        };

        const pipelineSum = [filter1, filter2, filter3, filter4, filter5, filter6];
        const resServices = await Guest.aggregate(pipelineSum);  
        if (!resServices) return res.status(404).send();

        // insert miscellaneous to guest miscellaneous 
        const pipelineItems = [filter1, filter2, filter3, filter4, filter5];
        const resItems = await Guest.aggregate(pipelineItems);  
        if (!resItems) return res.status(404).send();

        for (const itemDetail of resItems) {    
            if (itemDetail) {
                const serv = itemDetail.servicesDetail.services;
                const data = new GuestServiceTransaction({
                    hotelId,
                    guestId,
                    serviceId: serv.id,
                    name: serv.name,
                    serviceChargePercentage: serv.serviceChargePercentage,
                    serviceCharge: serv.serviceCharge,
                    gstPercentage: serv.gstPercentage,
                    gstCharge: serv.gstCharge,
                    unitPrice: serv.unitPrice,
                    quantity: serv.quantity,
                    totalPrice: serv.totalPrice,
                    orderDate: itemDetail.servicesDetail.orderDate,
                    orderTime: itemDetail.servicesDetail.orderTime,
                    despatchDate: itemDetail.servicesDetail.despatchDate,
                    despatchTime: itemDetail.servicesDetail.despatchTime
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
                    'expensesPaymentsDetail': new expenseTransactionType(transactionId, resServices[0].total)
                }
            }
        );    
        if (!resExpenseUpdate) return res.status(400).send();

        // update balance
        const resUpdateBalance = await Guest.findByIdAndUpdate(
            mongoose.Types.ObjectId(guestId), 
            { $inc: { balance: (resServices[0].total * -1)} }
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
                    'servicesDetail.$[ed].isPostedToExpense': true
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
    handelDetail,
    handelOrder,
    handelDelivery,
    handelCheckout
}