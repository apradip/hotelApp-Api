const mongoose = require("mongoose");
const Hotel = require("./hotels");
const Guest = require("../models/guests");
const Services = require("../models/services");
const GuestServiceTransaction = require("../models/guestServicesTransaction");
const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
const date = require("date-and-time");

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

class expenseType {
    constructor(expenseId, billNo, expenseAmount) {
        this.billNo = billNo,
        this.type = "S",
        this.expenseId = expenseId,
        this.expenseAmount = expenseAmount,
        this.narration = "Expense for the service items."
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
                $or: [{option: "R"}, {option: "S"}]
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
                roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0
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
                const item = {
                    id: element._id,
                    name: element.name,
                    mobile: element.mobile,
                    guestCount: element.guestCount,
                    corporateName: element.corporateName,
                    corporateAddress: element.corporateAddress,
                    gstNo: element.gstNo,
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
    let serviceList = [];

    const {hotelId, guestId} = req.params;
    const option = req.query.option;

    try {
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
                $unwind: "$servicesDetail"
            };
            const filter3 = {
                $match: {
                    "servicesDetail.despatchDate": {$exists: false},
                    "servicesDetail.despatchTime": {$exists: false}
                }
            };
            const filter4 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0    
                }
            };
            const filter5 = { 
                $unwind: "$servicesDetail.services" 
            };

            const pipeline = [filter1, filter2, filter3, filter4, filter5];
            foundGuestServiceList = await Guest.aggregate(pipeline)  ;

        } else if (option === "A") {
            const filter1 = {
                $match: {
                    _id: mongoose.Types.ObjectId(guestId),         
                    hotelId,
                    isEnable: true
                }
            };
            const filter2 = {
                $unwind: "$servicesDetail"
            };
            const filter3 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0
    
                }
            };
            const filter4 = { 
                $unwind: "$servicesDetail.services"
            }; 

            const pipeline = [filter1, filter2, filter3, filter4];
            foundGuestServiceList = await Guest.aggregate(pipeline);  
        } 

        if (!foundGuestServiceList) return res.status(404).send();

        foundGuestServiceList.forEach(async servicesDetail => {
            const transactionId = servicesDetail.servicesDetail._id;
            const service = servicesDetail.servicesDetail.services;
            
            const dataOrder = {
                transactionId: transactionId,
                serviceId: service.serviceId,
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
            };

            serviceList.push(dataOrder);
        });
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(serviceList);
};


// handel order
//query string : hotel Id / guest Id
//body : {"transactionId": "", "services": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    try {
        const {hotelId, guestId} = req.params;
        const {transactionId, services} = req.body;

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
                    $unwind: "$servicesDetail"
                };
                const filter3 = {
                    $match: {
                        "servicesDetail._id": mongoose.Types.ObjectId(transactionId)
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
                            "servicesDetail.$[ed].services": servicesDb
                        }
                    },
                    { 
                        arrayFilters: [{
                            "ed._id": mongoose.Types.ObjectId(transactionId)
                        }]           
                    }
                );  
                if (!resServiceUpdate) return res.status(404).send();
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
        date.format(new Date(), "YYYY-MM-DD"), 
        date.format(new Date(), "HH:mm"));

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
                    "servicesDetail.$[ele].despatchDate": date.format(new Date(), "YYYY-MM-DD"), 
                    "servicesDetail.$[ele].despatchTime": date.format(new Date(), "HH:mm")
                }
            },
            { 
                arrayFilters: [ 
                    {"ele._id": mongoose.Types.ObjectId(transactionId)}
                ]           
            }
        );  
        if (!resDelivery) return res.status(404).send(resDelivery);

        return res.status(200).send(resDelivery);
    } catch(e) {
        return res.status(500).send(e);
    }
   
}


// handle guest bill summery
//query string : hotel Id / guest Id
const handelGenerateBill = async (req, res) => {
    const {hotelId, guestId} = req.params;

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
            $unwind: "$servicesDetail"
        };
        const filter3 = {
            $match: {
                "servicesDetail.isPostedToExpense": false
            }
        };
        const filter4 = {
            $project: {
                _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                corporateName: 0, corporateAddress: 0, gstNo: 0, 
                roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                expensesPaymentsDetail: 0, balance: 0, inDate: 0, inTime: 0,
                option: 0, isActive: 0, isEnable: 0
            }
        };
        const filter5 = { 
            $unwind: "$servicesDetail.services"
        };  
        const filter6 = {
            $group: {
                _id: "$servicesDetail._id",
              total: {$sum: "$servicesDetail.services.totalPrice"}
            }
        };

        const pipelineSum = [filter1, filter2, filter3, filter4, filter5, filter6];
        const resServices = await Guest.aggregate(pipelineSum);
        if (!resServices) return res.status(404).send();

        // insert services to guest services transaction
        const pipelineItems = [filter1, filter2, filter3, filter4, filter5];
        const resItems = await Guest.aggregate(pipelineItems);
        if (!resItems) return res.status(404).send();

        for (const itemDetail of resItems) {    
            if (itemDetail) {
                const serv = itemDetail.servicesDetail.services;
                const data = new GuestServiceTransaction({
                    hotelId,
                    guestId,
                    serviceId: serv.serviceId,
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
        for (const sum of resServices) {
            // get hotel last bill no
            let billNo = await Hotel.getLastBillNo(hotelId);
            billNo += 1; 

            const resExpenseUpdate = await Guest.updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId),
                    "expensesPaymentsDetail": {
                        $not: {
                            $elemMatch: {
                                _id: mongoose.Types.ObjectId(sum._id)
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
                    type: "S",
                    expenseId: sum._id,
                    expenseAmount: sum.total,
                    narration: "Expense for the service items."
                });
    
                const resAdd = await data.save();
                if (!resAdd) return res.status(400).send();
            }

            // set hotel last bill no
            await Hotel.setLastBillNo(hotelId, billNo);

            // update balance
            const resUpdateBalance = await Guest.findByIdAndUpdate(
                mongoose.Types.ObjectId(guestId), 
                {$inc: {balance: (sum.total * -1)}}
            );

            if (!resUpdateBalance) return res.status(404).send();

            // update isPostedToExpense status
            const resUpdateExpenseStatus = await Guest.updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId)
                },
                {
                    $set: {
                        "servicesDetail.$[ex].isPostedToExpense": true
                    }
                },
                { 
                    arrayFilters: [{
                        "ex._id": mongoose.Types.ObjectId(sum._id)
                    }]           
                }
            );

            if (!resUpdateExpenseStatus) return res.status(404).send();
        }


        // get all misc item 
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
                "expensesPaymentsDetail.type": "S"
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
            $unwind: "$servicesDetail"
        };
        const filter3 = {
            $match: {
                "servicesDetail.isPostedToExpense": true,
                "servicesDetail._id": mongoose.Types.ObjectId(transactionId)
            }
        };
        const filter4 = {
            $project: {
                _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                corporateName: 0, corporateAddress: 0, gstNo: 0, 
                roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                expensesPaymentsDetail: 0, balance: 0, inDate: 0, inTime: 0,
                option: 0, isActive: 0, isEnable: 0
            }
        };
        const filter5 = { 
            $unwind: "$servicesDetail.services"
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
}