const mongoose = require('mongoose');
const Hotel = require('./hotels');
const Guest = require('../models/guests');
const GuestExpensePayment = require('../models/guestExpensesPayments');


class paymentTransactionType {
    constructor(paymentAmount, narration) {
        this.type = "P",
        this.paymentAmount = paymentAmount,
        this.narration = narration
    }
}

//handel search payment
//query string : hotel Id
//query string : guest detail, amount between, between dates
const handelSearch = async (req, res) => {
    try {
        const {hotelId} = req.params;
        const search = req.query.search;

        // const searchStructure = {
        //                             guest: "",
        //                             amount: {min: 0, max: 0}, 
        //                             date: {min: '', max: ''}
        //                         };

        const searchGuest = search.guest;
        const searchAmount = search.amount; 
        const searchAmountMin = searchAmount.min;
        const searchAmountMax = searchAmount.max;
        const searchDate = search.date;
        const searchDateStart = searchDate.start;
        const searchDateEnd = searchDate.end;

        var filterData = [];

        filterData = await GuestExpensePayment.find({hotelId, isEnable: true})
                    .sort('transactionDate')                                
                    .select('_id hotelId guestId expenseAmount paymentAmount narration transactionDate transactionTime updatedDate')
                    .exec();

        if (searchGuest !== "") {
            const filterGuestData = await Guest.find({hotelId, isEnable: true, 
                                                $or: [{name: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                {fatherName: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                {address: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                {city: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                {policeStation: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                {state: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
                                                {pin: {$regex: ".*" + search.trim() + ".*"}},
                                                {mobile: {$regex: ".*" + search.trim() + ".*"}}]})
                                            .sort("name")                                
                                            .select("_id").exec();
            
            if (filterGuestData) {                                            
                filterData = await filterData.find({guestId: {$in:filterGuestData}})
                    .sort('transactionDate')                                
                    .select('_id hotelId guestId expenseAmount paymentAmount narration transactionDate transactionTime updatedDate')
                    .exec();
            }
        }

        if ((searchAmountMin > 0) || (searchAmountMax > 0)) {
            filterData = await filterData.find({$or: [{expenseAmount: {$lte: searchAmountMin}},
                                                            {expenseAmount: {$gte: searchAmountMax}},
                                                            {paymentAmount: {$lte: searchAmountMin}},
                                                            {paymentAmount: {$gte: searchAmountMax}},
                                                            ]})
                                                        .sort('transactionDate')                                
                                                        .select('_id hotelId guestId expenseAmount paymentAmount narration transactionDate transactionTime updatedDate')
                                                        .exec();
        }

        if ((searchDateStart !== "") || (searchDateEnd !== "")) {
            filterData = await filterData.find({transactionDate: {$lte: searchDateEnd},
                transactionDate: {$gte: searchDateStart}})
                                                        .sort('transactionDate')                                
                                                        .select('_id hotelId guestId expenseAmount paymentAmount narration transactionDate transactionTime updatedDate')
                                                        .exec();
        }
        
        return res.status(200).send(filterData);        
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel detail payment
//query string : hotel Id / id=[guestId/_id] / option=[All/Single/Expense/Payment] 
const handelDetail = async (req, res) => {
    try{
        const {hotelId, id, option} = req.params;

        if (option.toUpperCase() === "A") {
            const data = await GuestExpensePayment.find({hotelId, guestId: id, isEnable: true}).exec();
            if (!data) return res.status(404).send();

            return res.status(200).send(data);

        } else if (option.toUpperCase() === "S") {
            const data = await GuestExpensePayment.find({hotelId, _id: id, isEnable: true}).exec();
            if (!data) return res.status(404).send();
    
            return res.status(200).send(data);

        } else if (option.toUpperCase() === "E") {
            const data = await GuestExpensePayment.find({hotelId, guestId: id, isEnable: true, expenseAmount: {$gte : 0}}).exec();
            if (!data) return res.status(404).send();
    
            return res.status(200).send(data);

        } else if (option.toUpperCase() === "P") {
            const data = await GuestExpensePayment.find({hotelId, guestId: id, isEnable: true, paymentAmount: {$gte : 0}}).exec();
            if (!data) return res.status(404).send();
    
            return res.status(200).send(data);

        } else if (option.toUpperCase() === "TE") {
            const sum = await totalExpense(hotelId, id);
            return res.status(200).send(sum);
            
        } else if (option.toUpperCase() === "TP") {
            const sum = await totalPayment(hotelId, id);
            return res.status(200).send(sum);
        
        } else if (option.toUpperCase() === "TB") {
            const expense = await totalExpense(hotelId, id);
            const payment = await totalPayment(hotelId, id);
            const balance = expense - payment;

            return res.status(200).send(balance);
        }

        return res.status(500);     
    } catch(e) {
        return res.status(500).send(e);
    }
}

async function totalExpense(hotelId, guestId) {
    try {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                let total = 0;
                const data = await GuestExpensePayment.find({hotelId, guestId, isEnable: true})
                                        .select('expenseAmount')
                                        .exec();

                data.forEach(element => {
                    total +=  element.expenseAmount;
                });

                resolve(total);
            },1);
        });
    } catch(e) {
        return 0;
    }        
}

async function totalPayment(hotelId, guestId) {
    try {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                let total = 0;
                const data = await GuestExpensePayment.find({hotelId, guestId, isEnable: true})
                                        .select('paymentAmount')
                                        .exec();

                data.forEach(element => {
                    total +=  element.paymentAmount;
                });

                resolve(total);
            },1);
        });
    } catch(e) {
        return 0;
    }        
}

//handel add payment
//query string : hotel Id / guest Id 
//body : {"amount" : 0, "narration" : ""}
const handelCreate = async (req, res) => {
    try {
        const { hotelId, guestId } = req.params;
        const { amount, narration } = req.body;
        
        // if (type.toUpperCase() === "E") {
        //     // const data = new GuestExpensePayment({
        //     //                                 hotelId,
        //     //                                 guestId,          
        //     //                                 expenseAmount: amount,
        //     //                                 narration,
        //     //                                 transactionDate,
        //     //                                 transactionTime
        //     //                             });

        //     // const resAdd = await data.save();
        //     // if (!resAdd) return res.status(400).send();

        //     return res.status(200).send();

        // } else if (type.toUpperCase() === "P") {

            // insert into guest payment 
            const resPaymentUpdate = await Guest.updateOne(
                {
                    _id: mongoose.Types.ObjectId(guestId)
                },
                {
                    $push: {
                        'expensesPaymentsDetail': new paymentTransactionType(amount, narration)
                    }
                }
            );    
            if (!resPaymentUpdate) return res.status(400).send();

            // update balance
            const resBalanceUpdate = await Guest.findByIdAndUpdate(
                mongoose.Types.ObjectId(guestId), 
                { $inc: { balance: amount } }
            );  
            if (!resBalanceUpdate) return res.status(404).send();

            // // insert into guest transaction payment 
            // const data = new GuestExpensePayment({hotelId,
            //                                 guestId,          
            //                                 paymentAmount: amount,
            //                                 narration});

            // const resAdd = await data.save();
            // if (!resAdd) return res.status(400).send();

            return res.status(200).send();
        // }

    } catch(e) {
        return res.status(500).send(e);
    }        
}

async function create(hotelId, guestId, type, amount, narration, transactionDate) {
    try {
        if (type.toUpperCase() === "E") {
            const data = new GuestExpensePayment({hotelId,
                                            guestId,          
                                            expenseAmount: amount,
                                            narration,
                                            transactionDate});

            const resAdd = await data.save();
            if (!resAdd) return false;

            return true;

        } else if (type.toUpperCase() === "P") {
            const data = new GuestExpensePayment({hotelId,
                                            guestId,          
                                            paymentAmount: amount,
                                            narration,
                                            transactionDate});

            const resAdd = await data.save();
            if (!resAdd) return false;

            return true;
        }

        return false;
    } catch(e) {
        return false;
    }        
}

//handel update payment
//query string : hotel Id / guest Id / transaction Id
//body : {"amount" : 0, "narration" : ""}
const handelUpdate = async (req, res) => {
    try {
        const { hotelId, guestId, transactionId } = req.params;
        const { amount, narration } = req.body;

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
            $unwind: '$expensesPaymentsDetail'
        };
        const filter3 = {
            $match: {
                'expensesPaymentsDetail._id': mongoose.Types.ObjectId(transactionId)
            }
        };
        const filter4 = {
            $project: {
                _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                corporateName: 0, corporateAddress: 0, gstNo: 0, 
                roomsDetail: 0, miscellaneousDetail: 0, servicesDetail: 0,
                tablesDetail: 0, balance: 0, inDate: 0, inTime: 0,
                option: 0, isActive: 0, isEnable: 0, updatedDate: 0
            }
        };

        const pipelineAmount = [filter1, filter2, filter3, filter4];
        const resAmount = await Guest.aggregate(pipelineAmount);  
        if (!resAmount) return res.status(404).send();

        const prvAmount = resAmount[0].expensesPaymentsDetail.paymentAmount;


        // get guest transaction 
        const resultGuest = await Guest.findOne(
            {
                _id: mongoose.Types.ObjectId(guestId),
                hotelId
            }
        );    
        if (!resultGuest) return res.status(400).send();
        

        // delete guest transaction 
        const resPaymentUpdate = await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId),
                hotelId
            },
            {
                $set: { 
                        'expensesPaymentsDetail.$[ed].paymentAmount': amount,
                        'expensesPaymentsDetail.$[ed].narration': narration,
                        'expensesPaymentsDetail.$[ed].transactionDate': new Date(),
                }
            },
            { 
                arrayFilters: [{
                    'ed._id': mongoose.Types.ObjectId(transactionId)
                }]           
            }
        );    
        if (!resPaymentUpdate) return res.status(400).send();

        // update balance
        const resBalanceUpdate = await Guest.findByIdAndUpdate(
            mongoose.Types.ObjectId(guestId), 
            { $inc: { balance: (prvAmount * -1) + amount } }
        );  
        if (!resBalanceUpdate) return res.status(404).send();


        // if (await remove(hotelId, _id)) {
        //     if (await create(hotelId, guestId, type, amount, narration, transactionDate)) {
        //         return res.status(200);
        //     } else {
        //         return res.status(404);
        //     }
        // } else {
        //     return res.status(404);
        // }
    } catch(e) {
        return res.status(500).send(e);
    }

    return res.status(200).send();
}

//handel delete payment
//query string : hotel Id / guest Id / transaction Id
const handelRemove = async (req, res) => {
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
            $unwind: '$expensesPaymentsDetail'
        };
        const filter3 = {
            $match: {
                'expensesPaymentsDetail._id': mongoose.Types.ObjectId(transactionId)
            }
        };
        const filter4 = {
            $project: {
                _id: 0, hotelId: 0, name: 0, mobile: 0, guestCount: 0, 
                corporateName: 0, corporateAddress: 0, gstNo: 0, 
                roomsDetail: 0, miscellaneousDetail: 0, servicesDetail: 0,
                tablesDetail: 0, balance: 0, inDate: 0, inTime: 0,
                option: 0, isActive: 0, isEnable: 0, updatedDate: 0
            }
        };

        const pipelineAmount = [filter1, filter2, filter3, filter4];
        const resAmount = await Guest.aggregate(pipelineAmount);  
        if (!resAmount) return res.status(404).send();

        const prvAmount = resAmount[0].expensesPaymentsDetail.paymentAmount;

        // delete guest transaction 
        const resPaymentUpdate = await Guest.updateOne(
            {
                _id: mongoose.Types.ObjectId(guestId),
                hotelId: hotelId,
                isActive: true,
                isEnable: true
            },
            {
                $pull: {
                        expensesPaymentsDetail: {_id: mongoose.Types.ObjectId(transactionId)}
                    }
            }
        );    
        if (!resPaymentUpdate) return res.status(400).send();

        // update balance
        const resBalanceUpdate = await Guest.findByIdAndUpdate(
            mongoose.Types.ObjectId(guestId), 
            { $inc: { balance: (prvAmount * -1)} }
        );  
        if (!resBalanceUpdate) return res.status(404).send();


        // // const data = await GuestExpensePayment.find({hotelId, _id, isEnable: true}).exec();
        // // if (!data) return res.status(404).send();

        // // const resDelete = await GuestExpensePayment.updateMany(hotelId, _id, {$set: {isEnable: false}}).exec();
        // // if (!resDelete) return res.status(400).send(resDelete);

        return res.status(200).send();
    } catch(e) {
        return res.status(500).send(e);
    }
}

async function remove(hotelId, _id) {
    try {
        const data = await GuestExpensePayment.find({hotelId, _id, isEnable: true}).exec();
        if (!data) return false;

        const resDelete = await GuestExpensePayment.updateMany(hotelId, _id, {$set: {isEnable: false}}).exec();
        if (!resDelete) return false;

        return true;
    } catch(e) {
        return false;
    }
}

module.exports = {
    handelSearch,
    handelDetail,
    totalExpense,
    totalPayment,
    handelCreate,
    create,
    handelUpdate,
    handelRemove,
    remove
}