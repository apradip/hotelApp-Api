const GuestExpensePayment = require("../models/guestExpensesPayments");


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
//query string : hotel Id
//body : {"guestId": "", "type" : "[expense/payment]", "amount" : 0, "narration" : "", "transactionDate" : new Date()}
const handelCreate = async (req, res) => {
    try {
        const {hotelId} = req.params;
        const {guestId, type, amount, narration, transactionDate, transactionTime} = req.body;
        
        if (type.toUpperCase() === "E") {
            const data = new GuestExpensePayment({
                                            hotelId,
                                            guestId,          
                                            expenseAmount: amount,
                                            narration,
                                            transactionDate,
                                            transactionTime
                                        });

            const resAdd = await data.save();
            if (!resAdd) return res.status(400).send();

            return res.status(200).send(data);

        } else if (type.toUpperCase() === "P") {
            const data = new GuestExpensePayment({hotelId,
                                            guestId,          
                                            paymentAmount: amount,
                                            narration,
                                            transactionDate,
                                            transactionTime});

            const resAdd = await data.save();
            if (!resAdd) return res.status(400).send();

            return res.status(200).send(data);
        }

        // return res.status(400).send();
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
//query string : hotel Id / _id
//body : {"guestId" : "", "type" : "[expense/payment]", "amount" : 0, "narration" : "", "transactionDate" : new Date()}
const handelUpdate = async (req, res) => {
    try {
        const { hotelId, _id } = req.params;
        const {guestId, type, amount, narration, transactionDate} = req.body;

        if (await remove(hotelId, _id)) {
            if (await create(hotelId, guestId, type, amount, narration, transactionDate)) {
                return res.status(200);
            } else {
                return res.status(404);
            }
        } else {
            return res.status(404);
        }
    } catch(e) {
        return res.status(500).send(e);
    }
}

//handel delete payment
//query string : hotel Id / _id
const handelRemove = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await GuestExpensePayment.find({hotelId, _id, isEnable: true}).exec();
        if (!data) return res.status(404).send();

        const resDelete = await GuestExpensePayment.updateMany(hotelId, _id, {$set: {isEnable: false}}).exec();
        if (!resDelete) return res.status(400).send(resDelete);

        return res.status(200).send(resDelete);
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