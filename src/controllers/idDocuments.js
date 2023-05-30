const IDDocument = require("../models/idDocuments");


//handel search id document
//query string : ?search= id document name
const handelSearch = async (req, res) => {
    try {
        const search = req.query.search;
        const data = await IDDocument.find({isEnable: true})
                                        .sort("name")                                
                                        .select("_id name description");
        if (!data) return res.status(404).send();

        if (search) {
            const filterData = await IDDocument.find({isEnable: true, name: { $regex: ".*" + search.trim().toUpperCase() + ".*"}})
                                                .sort("name")                                
                                                .select("_id name description");
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel detail id document
//query string : /id document Id
const handelDetail = async (req, res) => {
    try{
        const _id = req.params._id;
        const data = await IDDocument.findOne({isEnable: true, _id});
        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel add id document
//body : { "name" : "", "description" : "" }
const handelCreate = async (req, res) => {
    try {
        const {name, description} = req.body;
        const data = new IDDocument({ 
                                        name: name.trim().toUpperCase(), 
                                        description: description.length > 0 ? description.trim() : ""
                                    });

        const duplicate = await IDDocument.find({isEnable: true, name});
        if (duplicate.length !== 0) return res.status(409).send("ID document level already exists!");

        const resAdd = await data.save();
        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
};


//handel update id document
//query string : /id document Id
//body : { "name" : "", "description" : "" }
const handelUpdate = async (req, res) => {
    try {
        const _id = req.params._id;
        const {name, description} = req.body;
        const data = await IDDocument.findOne({isEnable: true, _id});
        if (!data) return res.status(404).send();

        const duplicate = await IDDocument.find({isEnable: true, $or: [{name: name}]});
        if (duplicate.length > 0) {
            duplicate.map((item) => {
                if (item._id.toString() !== _id) {
                    return res.status(409).send("ID document already exists!");
                }
            })
        }

        const resUpdate = await IDDocument.findByIdAndUpdate(_id, { 
                                                                    name: name.trim().toUpperCase(), 
                                                                    description: description.length > 0 ? description.trim() : ""
                                                                });
        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel delete id document
//query string : /id document Id
const handelRemove = async (req, res) => {
    try {
        const _id = req.params._id;
        const data = await IDDocument.findOne({isEnable: true, _id});
        if (!data) return res.status(404).send();

        const resDelete = await IDDocument.findByIdAndUpdate(_id, {isEnable: false});
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