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
      this.gstPercentage = gstPercentage;
    }
};

class serviceTransactionType {
    constructor(services) {
        this.services = services
        this.isCheckedout = false
    };
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
    const hotelId = req.params.hotelId;
    const search = req.query.search;

    let pipeline = [];
    let returnList = [];

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
                roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0, expensesPaymentsDetail: 0,
                option: 0, isActive: 0, isEnable: 0
            }
        };

        if (!search) {
            pipeline = [filter1, filter3];
        } else {
            pipeline = [filter1, filter2, filter3];
        }

        const data = await Guest.aggregate(pipeline); 
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
                totalBalance: element.balance,
                transactionId: await getActiveService(element.servicesDetail) 
            };
            
            returnList.push(item);
        }));
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send(returnList);
};


// handel show all orders
//query string : hotel Id / guest Id 
//query string : option = option: [non delivery / all]
const handelDetail = async (req, res) => {
    const {hotelId, guestId} = req.params;
    const option = req.query.option;

    let serviceList = [];

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
            const filter5 = {
                $match: {
                    "servicesDetail.services.despatchDate": {$exists: false},
                    "servicesDetail.services.despatchTime": {$exists: false}
                }
            };

            const pipeline = [filter1, filter2, filter3, filter4, filter5];
            foundGuestServiceList = await Guest.aggregate(pipeline);

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

        // if (!foundGuestServiceList) return res.status(404).send();

        await Promise.all(foundGuestServiceList.map(async (servicesDetail) => {    
            const transactionId = servicesDetail.servicesDetail._id;
            const service = servicesDetail.servicesDetail.services;
            
            const dataOrder = {
                transactionId: transactionId,
                serviceTransactionId: service._id,
                id: service.id,
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
        }));
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(serviceList);
};


// handel order
//query string : hotel Id / guest Id / transaction Id
//body : {"transactionId": "", "services": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;
    const {services} = req.body;

    let servicesDb = undefined;

    try {
        // get hotel tax details    
        const hotel = await Hotel.detail(hotelId);

        if (transactionId !== "undefined") {
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

                await Promise.all(services.map(async (service) => {    
                    if (((service.operation) === "M") || ((service.operation) === "R")) {
                        const keyToFind = "id";
                        const valueToFind = service.id;
                        servicesDb = servicesDb.filter(obj => obj[keyToFind] !== valueToFind);
                    }
                }));

                await Promise.all(services.map(async (service) => {    
                    if (((service.operation) === "A") || ((service.operation) === "M")) {
                        
                        // check for item existance
                        const serviceMaster = await Services.findOne(
                            {
                                _id: mongoose.Types.ObjectId(service.id), 
                                hotelId: hotel._id, 
                                isEnable: true
                            }
                        );    
        
                        if (serviceMaster) {
                            servicesDb.push(new serviceType(
                                serviceMaster._id, 
                                serviceMaster.name, 
                                serviceMaster.price,
                                service.quantity,
                                hotel.serviceChargePercentage,
                                hotel.foodGstPercentage
                            ));
                        }
                    }
                }));

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
        }

        return res.status(200).send();
    } catch(e) {
        return res.status(500).send(e);
    }
}

async function newServiceValues(hotel, services) {
    // insert all add / modify operation items
    const transaction = new serviceTransactionType([]);

    await Promise.all(services.map(async (service) => {         
        // delete all remove / modify operation service    
        if ((service.operation) === "A") {
            
            // check for item existance
            const serviceMaster = await Services.findOne(
                {
                    _id: mongoose.Types.ObjectId(service.id), 
                    hotelId: hotel._id, 
                    isEnable: true
                }
            );    

            if (serviceMaster) {
                transaction.services.push(new serviceType(
                    serviceMaster._id, 
                    serviceMaster.name, 
                    serviceMaster.price,
                    service.quantity,
                    hotel.serviceChargePercentage,
                    hotel.foodGstPercentage
                ));
            }
        }
    }));

    return transaction;
}


// handel delivery
//query string : hotel Id / guest Id / transaction Id
const handelDelivery = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;
    const {services} = req.body;

    try {
        await Promise.all(services.map(async (item) => {         
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
                            "servicesDetail.$[ele].services.$[sele].despatchDate": date.format(new Date(), "YYYY-MM-DD"), 
                            "servicesDetail.$[ele].services.$[sele].despatchTime": date.format(new Date(), "HH:mm")
                        }
                    },
                    { 
                        arrayFilters: [ 
                            {"ele._id": mongoose.Types.ObjectId(transactionId)},
                            {"sele._id": mongoose.Types.ObjectId(item.serviceTransactionId)}
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
                    $unwind: "$servicesDetail"
                };
                const filter3 = {
                    $match: {
                        "servicesDetail._id": mongoose.Types.ObjectId(transactionId)
                    }
                };
                const filter4 = { 
                    $unwind: "$servicesDetail.services" 
                };  
                const filter5 = {
                    $match: {
                        "servicesDetail.services._id": mongoose.Types.ObjectId(item.serviceTransactionId)
                    }
                };
                const filter6 = {
                    $project: {
                        _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                        corporateName: 0, corporateAddress: 0, gstNo: 0, 
                        roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                        expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                        option: 0, isActive: 0, isEnable: 0                    }
                };
                
                const pipelineService = [filter1, filter2, filter3, filter4, filter5, filter6];
                const resService = await Guest.aggregate(pipelineService);
                if (!resService) return res.status(404).send();
        

                //append the current product to transaction document
                // for (const item of resService) {
                await Promise.all(resService.map(async (serviceItem) => {         
                    const service = serviceItem.servicesDetail.services;

                    if (service) {
                        const data = new GuestServiceTransaction({
                            hotelId,
                            guestId,
                            serviceId: service.id,
                            name: service.name,
                            serviceChargePercentage: service.serviceChargePercentage,
                            serviceCharge: service.serviceCharge,
                            gstPercentage: service.gstPercentage,
                            gstCharge: service.gstCharge,
                            unitPrice: service.unitPrice,
                            quantity: service.quantity,
                            totalPrice: service.totalPrice,
                            orderDate: service.orderDate,
                            orderTime: service.orderTime,
                            despatchDate: service.despatchDate,
                            despatchTime: service.despatchTime
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
                                    balance: (service.totalPrice.toFixed(0) * -1)
                                }
                            }
                        );  
                        if (!resBalance) return res.status(404).send(resBalance);
                    }
                }));   
            }
        }));

        return res.status(200).send();
    } catch(e) {
        return res.status(500).send(e);
    }
   
}


// handle guest bill summery
//query string : hotel Id / guest Id / transaction Id
const handelGenerateBill = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;
   
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
            $unwind: "$servicesDetail"
        };
        const filterSum3 = {
            $match: {
                "servicesDetail._id": mongoose.Types.ObjectId(transactionId)
            }
        };
        const filterSum4 = { 
            $unwind: "$servicesDetail.services" 
        };  
        const filterSum5 = {
            $group: {
                _id: "$servicesDetail._id",
                total: {$sum: "$servicesDetail.services.totalPrice"}
            }
        };

        const pipelineSum = [filterSum1, filterSum2, filterSum3, filterSum4, filterSum5];
        const resSum = await Guest.aggregate(pipelineSum);
        // End :: calculate food total


        // Start :: insert into expense if the transaction is not in guest 
        if (resSum.length > 0) {
            total = resSum[0].total;

            // Start :: update expense in guest
            const resExpenseUpdate = await Guest.updateOne(
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


            if (resExpenseUpdate.matchedCount === 0) {
                // get hotel last bill no
                let billNo = await Hotel.getLastBillNo(hotelId);
                billNo += 1; 
    
                // set hotel last bill no
                await Hotel.setLastBillNo(hotelId, billNo);
    
                // Start :: insert expense into guest
                const resExpenseInsert = await Guest.updateOne(
                    {
                        _id: mongoose.Types.ObjectId(guestId),
                        hotelId: hotelId,
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
                const data = new GuestExpensesPaymentsTransaction({
                    hotelId,
                    guestId,
                    billNo: billNo,
                    type: "S",
                    expenseId: transactionId,
                    expenseAmount: total,
                    narration: "Expense for the service items."
                });
        
                const resAdd = await data.save();
                // End :: insert expense into expense transaction
            } else {
                // Start :: update expense payment transaction
                const resExpense = await GuestExpensesPaymentsTransaction.updateOne(
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


        // calculate and update food total
        const filterBill1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
        const filterBill2 = {
            $unwind: "$servicesDetail"
        };
        const filterBill3 = {
            $unwind: "$expensesPaymentsDetail"
        };
        const filterBill4 = {
            $match: {
                "servicesDetail._id": mongoose.Types.ObjectId(transactionId),
                "expensesPaymentsDetail.expenseId": transactionId
            }
        };
        const filterBill5 = {
            $project: {
                _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                corporateName: 0, corporateAddress: 0, gstNo: 0, 
                roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
                balance: 0, inDate: 0, inTime: 0, option: 0, isActive: 0, 
                isEnable: 0, __v: 0,
                "servicesDetail.isCheckedout": 0, "servicesDetail._id": 0, 
            }
        };

        const pipelineBill = [filterBill1, filterBill2, filterBill3, filterBill4, filterBill5];
        const resBill = await Guest.aggregate(pipelineBill);
        if (!resBill) return res.status(404).send();

        return res.status(200).send(resBill);        
    } catch(e) {
        return res.status(500).send(e);
    }
};


// // handle guest bill summery
// //query string : hotel Id / guest Id / transaction Id / option [v = view / p = print]
// const handelBillDetail = async (req, res) => {
//     const {hotelId, guestId, transactionId, option} = req.params;

//     try {
//         // calculate and update food total
//         const filter1 = {
//             $match: {
//                 _id: mongoose.Types.ObjectId(guestId),         
//                 hotelId: hotelId,
//                 isActive: true,
//                 isEnable: true
//             }
//         };
//         const filter2 = {
//             $unwind: '$servicesDetail'
//         };
//         const filter3 = {
//             $match: {
//                 'servicesDetail._id': mongoose.Types.ObjectId(transactionId)
                
//             }
//         };
//         const filter4 = {
//             $project: {
//                 _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
//                 corporateName: 0, corporateAddress: 0, gstNo: 0, 
//                 roomsDetail: 0, tablesDetail: 0, miscellaneousesDetail: 0,
//                 expensesPaymentsDetail: 0, balance: 0, inDate: 0, inTime: 0,
//                 option: 0, isActive: 0, isEnable: 0
//             }
//         };
//         const filter5 = { 
//             $unwind: '$servicesDetail.services' 
//         };  

//         const pipelineBill = [filter1, filter2, filter3, filter4, filter5];
//         const resBill = await Guest.aggregate(pipelineBill);
//         if (!resBill) return res.status(404).send();

//         return res.status(200).send(resBill);
//     } catch(e) {
//         return res.status(500).send(e);
//     }
// };


// handle guest checkout 
//query string : hotel Id / guest Id / transaction Id
const handelCheckout = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;

    try {
        // update out date & time
        const resUpdateOut = await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId),
                hotelId: hotelId,
                isActive: true,
                isEnable: true,
                servicesDetail: {
                    $elemMatch: {
                        _id: mongoose.Types.ObjectId(transactionId)
                    }
                }
            },
            {
                $set: {
                    "servicesDetail.$.isCheckedout": true,
                    outDate: date.format(new Date(), "YYYY-MM-DD"), 
                    outTime: date.format(new Date(), "HH:mm"),
                    isActive: false
                }
            }
        );

        if (!resUpdateOut) return res.status(404).send();
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();    
};


async function getActiveService(detail) {
    let transactionId = "undefined";

     await Promise.all(detail.map(async (item) => {         
        if ((!item.isCheckedout) && (transactionId === "undefined")) {
            transactionId = item._id.toHexString();
        }
    }));

    return transactionId;
}

module.exports = {
    handelSearch,
    handelDetail,
    handelOrder,
    handelDelivery,
    handelGenerateBill,
    // handelBillDetail,
    handelCheckout
}