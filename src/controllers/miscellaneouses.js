const Miscellaneous = require('../models/miscellaneouses');


//handel search miscellaneous
//query string : hotel Id?search= name
const handelSearch = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const search = req.query.search;
        
        const data = await Miscellaneous.find({hotelId, isEnable: true})
                                        .sort('name')                                
                                        .select('hotelId _id name price description').exec();
        if (!data) return res.status(404).send();

        if (search) {
            const filterData = await Miscellaneous.find({hotelId, isEnable: true, name: {$regex: '.*' + search.trim().toUpperCase() + '.*'}})
                                                .sort('name')                                
                                                .select('hotelId _id name price description').exec();
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }
    
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel detail miscellaneous
//query string : hotel Id / item Id
const handelDetail = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Miscellaneous.findOne({hotelId, isEnable: true, _id}).exec();

        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel add miscellaneous
//query string : hotel Id
//body : { "name" : "", "price": 0,"description" : "" }
const handelCreate = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const {name, price, description} =  req.body;
        
        const data = new Miscellaneous({
            hotelId,
            name: name.trim().toUpperCase(),
            price: price,
            description: description.trim(), 
        });

        const duplicate = await Miscellaneous.find({hotelId, isEnable: true, name: data.name}).exec();
        if (duplicate.length !== 0) return res.status(409).send("Miscellaneous already exists!");

        const resAdd = await data.save();
        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
}


//handel update miscellaneous
//query string : hotel Id / miscellaneous Id
//body : { "name" : "", "price": 0, "description" : "" }
const handelUpdate = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const {name, price, description} =  req.body;

        const data = await Miscellaneous.findOne({hotelId, isEnable: true, _id}).exec();
        if (!data) return res.status(404).send();

        const duplicate = await Miscellaneous.find({hotelId, isEnable: true, name: name.trim().toUpperCase()}).exec();
        if (duplicate.length > 0) {
            duplicate.map((miscellaneous) => {
                if (miscellaneous._id.toString() !== _id) {
                    return res.status(409).send("Miscellaneous already exists!");
                }
            })
        }

        const resUpdate = await Miscellaneous.findByIdAndUpdate(_id, {
                                                                name: name.trim().toUpperCase(),
                                                                price: price, 
                                                                description: description.trim()}).exec();
        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel delete miscellaneous
//query string : hotel Id / miscellaneous Id
const handelRemove = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;

        const data = await Miscellaneous.findOne({hotelId, isEnable: true, _id}).exec();

        if (!data) return res.status(404).send();

        const resDelete = await Miscellaneous.findByIdAndUpdate(_id, {isEnable: false}).exec();
        if (!resDelete) return res.status(400).send(resDelete);

        return res.status(200).send(resDelete);
    } catch(e) {
        return res.status(500).send(e);
    }
}


module.exports = {
    handelSearch,
    handelDetail,
    handelCreate,
    handelUpdate,
    handelRemove
}