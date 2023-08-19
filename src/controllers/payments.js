const mongoose = require("mongoose");
const ExpensePayment = require("../models/guestExpensePaymentTransaction");
const Guest = require("../models/guests");

class guest {
    constructor(id, guestId, guestName, mobile, corporateName, corporateAddress) {
        this.id = id,
        this.guestId = guestId,
        this.guestName = guestName,
        this.mobile = mobile,
        this.corporateName = corporateName,
        this.corporateAddress = corporateAddress
    }
};

class transaction {
    constructor(id, guestId, guestName, mobile, corporateName, corporateAddress, amount, narration, transactionDate, paymentType) {
        this.id = id,
        this.guestId = guestId,
        this.guestName = guestName,
        this.mobile = mobile,
        this.corporateName = corporateName,
        this.corporateAddress = corporateAddress,
        this.amount = amount,
        this.narration = narration,
        this.transactionDate = transactionDate,
        this.paymentType = paymentType
    }
};

//handel search guest
//query string : hotel Id?search= guest name, father name, mobile, address, city, police station, state, pin 
const handelSearch = async (req, res) => {
    const hotelId = req.params.hotelId;
    const search = req.query.search;
    const type = req.query.type;
    const startdate = req.query.startdate;
    const enddate = req.query.enddate;

    let pipeline = [];
    let transactionList = [];

    try {
        const filter1 = {
            $match: {
                hotelId
            }
        };
        const filter2 = {
            $match: {
                type: type.toUpperCase
            }
        };

        // const filter3 = {
        //     $match: {
        //         $or: [{name: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
        //         {mobile: {$regex: ".*" + search.trim() + ".*"}},
        //         {corporateName: {$regex: ".*" + search.trim().toUpperCase() + ".*"}},
        //         {corporateAddress: {$regex: ".*" + search.trim().toUpperCase() + ".*"}}]
        //     }
        // };

        const filter3 = {
            $sort: {
                transactionDate: 1, 
                // transactionTime: 1
            }
        };

        if (type) {
            pipeline = [filter1, filter2, filter3];    
        } else {
            pipeline = [filter1, filter3];
        }

        // if (search) {
            // pipeline = [filter1, filter2, filter3];
        // } else {
            // pipeline = [filter1, filter3];
        // }

        const dbTransaction = await ExpensePayment.aggregate(pipeline);
        await Promise.all(dbTransaction.map(async (transaction) => {
            let amount = 0;

            if (transaction.type = "P") {
                amount = transaction.paymentAmount;
            } else {
                amount = transaction.expenseAmount;
            }

            const guest = getGuest(hotelId, transaction.guestId);

            transactionList.push(new transaction(
                transaction._id,
                transaction.guestId,
                guest.name,
                guest.mobile,
                guest.corporateName,
                guest.corporateAddress,
                amount,
                transaction.narration,
                transaction.transactionDate,
                transaction.type));
        }))

        return res.status(200).send(transactionList);
    } catch(e) {
        return res.status(500).send(e);
    }
};


async function getGuest (hotelId, guestId) {
    let guest = undefined;

    try {
        const filter1 = {
            $match: {
                _id: mongoose.Types.ObjectId(guestId),         
                hotelId,
                isActive: true,
                isEnable: true
            }
        };
                
        const dbGuest = await Guest.aggregate([filter1]);
        
        if (dbGuest) {
            guest = new guest(
                dbGuest.id,
                dbGuest.name,
                dbGuest.mobile,
                dbGuest.corporateName,
                dbGuest.corporateAddress);
        }
    } catch(e) {
        return e;
    }

    return guest;
};


module.exports = {
    handelSearch
};