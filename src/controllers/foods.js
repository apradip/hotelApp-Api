const Food = require("../models/foods");


//handel search food
//query string : hotel Id?search= name
const handelSearch = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const search = req.query.search;
        
        const data = await Food.find({hotelId, isEnable: true})
                                        .sort('name')                                
                                        .select('hotelId _id name price description');
        if (!data) return res.status(404).send();

        if (search) {
            const filterData = await Food.find({hotelId, isEnable: true, name: {$regex: '.*' + search.trim().toUpperCase() + '.*'}})
                                                .sort('name')                                
                                                .select('hotelId _id name price description');
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }
    
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel detail food
//query string : hotel Id / food Id
const handelDetail = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Food.findOne({hotelId, isEnable: true, _id});

        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel add food
//query string : hotel Id
//body : { "name" : "", "price": 0,"description" : "" }
const handelCreate = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const {name, price, description} =  req.body;
        
        const data = new Food({
            hotelId,
            name: name.trim().toUpperCase(),
            price: price,
            description: description.length > 0 ? description.trim() : "", 
        });

        const duplicate = await Food.find({hotelId, isEnable: true, name: data.name});
        if (duplicate.length !== 0) return res.status(409).send("Food already exists!");

        const resAdd = await data.save();
        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
};


//handel update food
//query string : hotel Id / food Id
//body : { "name" : "", "price": 0, "description" : "" }
const handelUpdate = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const {name, price, description} =  req.body;
        const data = await Food.findOne({hotelId, isEnable: true, _id});
        if (!data) return res.status(404).send();

        const duplicate = await Food.find({hotelId, isEnable: true, name: name.trim().toUpperCase()});
        if (duplicate.length > 0) {
            duplicate.map((item) => {
                if (item._id.toString() !== _id) {
                    return res.status(409).send("Food already exists!");
                }
            })
        }

        const resUpdate = await Food.findByIdAndUpdate(_id, {
                                                                name: name.trim().toUpperCase(),
                                                                price: price, 
                                                                description: description.length > 0 ? description.trim() : ""});
        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel delete food
//query string : hotel Id / food Id
const handelRemove = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Food.findOne({hotelId, isEnable: true, _id});

        if (!data) return res.status(404).send();

        const resDelete = await Food.findByIdAndUpdate(_id, {isEnable: false});
        if (!resDelete) return res.status(400).send(resDelete);

        return res.status(200).send(resDelete);
    } catch(e) {
        return res.status(500).send(e);
    }
};


module.exports = {
    handelSearch,
    handelDetail,
    handelCreate,
    handelUpdate,
    handelRemove
};