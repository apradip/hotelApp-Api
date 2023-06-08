const mongoose = require("mongoose");
const Hotel = require("./hotels");
const Guest = require("../models/guests");
const Miscellaneous = require("../models/miscellaneouses");
const GuestMiscellaneousTransaction = require("../models/guestMiscellaneousesTransaction");
const GuestExpensesPaymentsTransaction = require("../models/guestExpensesPaymentsTransaction");
const date = require("date-and-time");

class miscellaneousType {
    constructor(id, name, unitPrice, quantity, serviceChargePercentage, gstPercentage) {
      this.miscellaneousId = id;
      this.name = name;
      this.unitPrice = unitPrice;
      this.quantity = quantity;
      this.serviceChargePercentage = serviceChargePercentage;
      this.gstPercentage = gstPercentage;
    };
};

class miscellaneousTransactionType {
    constructor(miscellaneouses, orderDate, orderTime) {
        this.miscellaneouses = miscellaneouses,
        this.orderDate = orderDate;
        this.orderTime = orderTime;
    };
};

class expenseType {
    constructor(expenseId, billNo, expenseAmount) {
        this.billNo = billNo,
        this.type = "M",
        this.expenseId = expenseId,
        this.expenseAmount = expenseAmount,
        this.narration = "Expense for the miscellaneous items."
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
                $or: [{option: "R"}, {option: "M"}]
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
                roomsDetail: 0, tablesDetail: 0, servicesDetail: 0
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
    let miscellaneousList = [];

    const {hotelId, guestId} = req.params;
    const option = req.query.option;

    try {
        let foundGuestMiscellaneousList = null;

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
                $unwind: "$miscellaneousesDetail"
            };
            const filter3 = {
                $match: {
                    "miscellaneousesDetail.despatchDate": {$exists: false},
                    "miscellaneousesDetail.despatchTime": {$exists: false}
                }
            };
            const filter4 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, tablesDetail: 0, servicesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0    
                }
            };
            const filter5 = { 
                $unwind: "$miscellaneousesDetail.miscellaneouses" 
            };

            const pipeline = [filter1, filter2, filter3, filter4, filter5];
            foundGuestMiscellaneousList = await Guest.aggregate(pipeline);

        } else if (option === "A") {
            const filter1 = {
                $match: {
                    _id: mongoose.Types.ObjectId(guestId),         
                    hotelId,
                    isEnable: true
                }
            };
            const filter2 = {
                $unwind: "$miscellaneousesDetail"
            };
            const filter3 = {
                $project: {
                    _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                    corporateName: 0, corporateAddress: 0, gstNo: 0,
                    roomsDetail: 0, tablesDetail: 0, servicesDetail: 0,
                    expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                    option: 0, isActive: 0, isEnable: 0
                    }
            };
            const filter4 = { 
                $unwind: "$miscellaneousesDetail.miscellaneouses"
            }; 

            const pipeline = [filter1, filter2, filter3, filter4];
            foundGuestMiscellaneousList = await Guest.aggregate(pipeline);  
        } 

        if (!foundGuestMiscellaneousList) return res.status(404).send();

        foundGuestMiscellaneousList.forEach(async miscellaneousDetail => {
            const transactionId = miscellaneousDetail.miscellaneousesDetail._id;
            const miscellaneous = miscellaneousDetail.miscellaneousesDetail.miscellaneouses;
            
            const dataOrder = {
                transactionId: transactionId,
                miscellaneousId: miscellaneous.miscellaneousId,
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
            };

            miscellaneousList.push(dataOrder);
        });
    } catch(e) {
        return res.status(500).send(e);
    }        

    return res.status(200).send(miscellaneousList);
};


// handel order
//query string : hotel Id / guest Id
//body : {"transactionId": "", "miscellaneouses": [{"id": "", "quantity": 0, "operation": "A/M/R"}] [A=ADD, M=MOD, R=REMOVE]}
const handelOrder = async (req, res) => {
    const {hotelId, guestId} = req.params;
    const {transactionId, miscellaneouses} = req.body;

    try {
        let miscellaneousesDb = undefined;
        
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
                    $unwind: "$miscellaneousesDetail"
                };
                const filter3 = {
                    $match: {
                        "miscellaneousesDetail._id": mongoose.Types.ObjectId(transactionId)
                    }
                };
                const filter4 = {
                    $project: {
                        _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                        corporateName: 0, corporateAddress: 0, gstNo: 0,
                        roomsDetail: 0, tablesDetail: 0, servicesDetail: 0,
                        expensesPaymentsDetail: 0, inDate: 0, inTime: 0,
                        option: 0, isActive: 0, isEnable: 0
                    }
                };
                const pipelineSum = [filter1, filter2, filter3, filter4];
                const resMiscellaneousesDetail = await Guest.aggregate(pipelineSum);
                if (!resMiscellaneousesDetail) return res.status(404).send();
                
                miscellaneousesDb = resMiscellaneousesDetail[0].miscellaneousesDetail.miscellaneouses;

                for (const miscellaneous of miscellaneouses) {        
                    if (miscellaneous) {
                        if (((miscellaneous.operation) === "M") || ((miscellaneous.operation) === 'R')) {
                            const keyToFind = "miscellaneousId";
                            const valueToFind = miscellaneous.id;
                            miscellaneousesDb = miscellaneousesDb.filter(obj => obj[keyToFind] !== valueToFind);
                        }
                    }
                };

                for (const miscellaneous of miscellaneouses) {       
                    if (((miscellaneous.operation) === "A") || 
                        ((miscellaneous.operation) === "M")) {
                        
                        // check for item existance
                        const foundMiscellaneous = await Miscellaneous.findOne({
                                _id: mongoose.Types.ObjectId(miscellaneous.id), 
                                hotelId: hotel._id, 
                                isEnable: true
                            }
                        );    
        
                        if (foundMiscellaneous) {
                            miscellaneousesDb.push(new miscellaneousType(
                                foundMiscellaneous._id, 
                                foundMiscellaneous.name, 
                                foundMiscellaneous.price,
                                miscellaneous.quantity,
                                hotel.serviceChargePercentage,
                                hotel.foodGstPercentage
                            ));
                        }
                    }
                };

                const resMiscellaneousUpdate = await Guest.updateOne(
                    {
                        _id: mongoose.Types.ObjectId(guestId), 
                        hotelId,
                        isActive: true,
                        isEnable: true
                    },
                    {
                        $set: {
                            "miscellaneousesDetail.$[ed].miscellaneouses": miscellaneousesDb
                        }
                    },
                    { 
                        arrayFilters: [{
                            "ed._id": mongoose.Types.ObjectId(transactionId)
                        }]           
                    }
                );

                if (!resMiscellaneousUpdate) return res.status(404).send();
            }
        } else {
            miscellaneousesDb = await newMiscellaneousValues(hotel, miscellaneouses);

            const resMiscellaneousUpdate = await Guest.updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId), 
                    hotelId,
                    isActive: true,
                    isEnable: true
                },
                {
                    $push: {
                        miscellaneousesDetail: miscellaneousesDb
                    }
                },
            );

            if (!resMiscellaneousUpdate) return res.status(404).send();
        }

        return res.status(200).send();
    } catch(e) {
        return res.status(500).send(e);
    }
};

async function newMiscellaneousValues(hotel, miscellaneouses) {
    // insert all add / modify operation items
    const transaction = new miscellaneousTransactionType(
        [], 
        date.format(new Date(), "YYYY-MM-DD"), 
        date.format(new Date(), "HH:mm"));

    for (const miscellaneous of miscellaneouses) {       
            
        // delete all remove / modify operation miscellaneouses    
        if ((miscellaneous.operation) === "A") {
            
            // check for item existance
            const foundMiscellaneous = await Miscellaneous.findOne(
                {
                    _id: mongoose.Types.ObjectId(miscellaneous.id), 
                    hotelId: hotel._id, 
                    isEnable: true
                }
            );    

            if (foundMiscellaneous) {
                transaction.miscellaneouses.push(new miscellaneousType(
                    miscellaneous.id, 
                    foundMiscellaneous.name, 
                    foundMiscellaneous.price,
                    miscellaneous.quantity,
                    hotel.serviceChargePercentage,
                    hotel.foodGstPercentage
                ));
            }
        }
    };

    return transaction;
};


// handel delivery
//query string : hotel Id / guest Id / transaction Id
const handelDelivery = async (req, res) => {
    const {hotelId, guestId, transactionId} = req.params;

    try {
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
                    "miscellaneousesDetail.$[ele].despatchDate": date.format(new Date(), "YYYY-MM-DD"), 
                    "miscellaneousesDetail.$[ele].despatchTime": date.format(new Date(), "HH:mm")
                }
            },
            { 
                arrayFilters: [{ 
                    "ele._id": mongoose.Types.ObjectId(transactionId)
                }]           
            }
        );

        if (!resDelivery) return res.status(404).send(resDelivery);

        return res.status(200).send(resDelivery);
    } catch(e) {
        return res.status(500).send(e);
    }
};


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
            $unwind: "$miscellaneousesDetail"
        };
        const filter3 = {
            $match: {
                "miscellaneousesDetail.isPostedToExpense": false
            }
        };
        const filter4 = {
            $project: {
                _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                corporateName: 0, corporateAddress: 0, gstNo: 0, 
                roomsDetail: 0, tablesDetail: 0, servicesDetail: 0,
                expensesPaymentsDetail: 0, balance: 0, inDate: 0, inTime: 0,
                option: 0, isActive: 0, isEnable: 0
            }
        };
        const filter5 = { 
            $unwind: "$miscellaneousesDetail.miscellaneouses"
        };  
        const filter6 = {
            $group: {
                _id: "$miscellaneousesDetail._id",
              total: { $sum: "$miscellaneousesDetail.miscellaneouses.totalPrice"}
            }
        };

        const pipelineSum = [filter1, filter2, filter3, filter4, filter5, filter6];
        const resMiscellaneouses = await Guest.aggregate(pipelineSum);
        if (!resMiscellaneouses) return res.status(404).send();

        // insert miscellaneous to guest miscellaneous transaction
        const pipelineItems = [filter1, filter2, filter3, filter4, filter5];
        const resItems = await Guest.aggregate(pipelineItems);
        if (!resItems) return res.status(404).send();

        for (const itemDetail of resItems) {    
            if (itemDetail) {
                const misc = itemDetail.miscellaneousesDetail.miscellaneouses;
                const data = new GuestMiscellaneousTransaction({
                    hotelId,
                    guestId,
                    miscellaneousId: misc.miscellaneousId,
                    name: misc.name,
                    serviceChargePercentage: misc.serviceChargePercentage,
                    serviceCharge: misc.serviceCharge,
                    gstPercentage: misc.gstPercentage,
                    gstCharge: misc.gstCharge,
                    unitPrice: misc.unitPrice,
                    quantity: misc.quantity,
                    totalPrice: misc.totalPrice,
                    orderDate: itemDetail.miscellaneousesDetail.orderDate,
                    orderTime: itemDetail.miscellaneousesDetail.orderTime,
                    despatchDate: itemDetail.miscellaneousesDetail.despatchDate,
                    despatchTime: itemDetail.miscellaneousesDetail.despatchTime
                });
        
                const resAdd = await data.save();
                if (!resAdd) return res.status(400).send();
            }
        }

        // insert into expense if the transaction is not present
        for (const sum of resMiscellaneouses) {
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
                    type: "M",
                    expenseId: sum._id,
                    expenseAmount: sum.total,
                    narration: "Expense for the miscellaneous items."
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
                        "miscellaneousesDetail.$[ex].isPostedToExpense": true
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
                "expensesPaymentsDetail.type": "M"
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
            $unwind: "$miscellaneousesDetail"
        };
        const filter3 = {
            $match: {
                "miscellaneousesDetail.isPostedToExpense": true,
                "miscellaneousesDetail._id": mongoose.Types.ObjectId(transactionId)
                
            }
        };
        const filter4 = {
            $project: {
                _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                corporateName: 0, corporateAddress: 0, gstNo: 0, 
                roomsDetail: 0, tablesDetail: 0, servicesDetail: 0,
                expensesPaymentsDetail: 0, balance: 0, inDate: 0, inTime: 0,
                option: 0, isActive: 0, isEnable: 0
            }
        };
        const filter5 = { 
            $unwind: "$miscellaneousesDetail.miscellaneouses"
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
                      outDate: date.format(new Date(),"YYYY-MM-DD"), 
                      outTime: date.format(new Date(),"HH:mm")} }
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