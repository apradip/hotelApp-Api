const GST = require('../models/gsts');


//handel search gst
//query string : search between minTariff, maxTariff
const handelSearch = async (req, res) => {
    try {
        const search = req.query.search;
        if (search === null || search <= 0) {
            return res.status(404).send();        
        };

        if (search > 0) {
            const filterData = await GST.findOne({isEnable: true, 
                                                  minTariff: {$lte: search},
                                                  maxTariff: {$gte: search}})
                                        .sort('gstPercentage')                                
                                        .select('_id minTariff maxTariff gstPercentage')
                                        .exec();
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel detail gst
//query string : gst Id
const handelDetail = async (req, res) => {
    try {
        const {_id} = req.params;
        const data = await GST.findOne({isEnable: true, _id}).exec();
        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel add gst
//body : { "minTariff" : 0, "maxTariff" : 0, "gstPercentage" : 0 }
const handelCreate = async (req, res) => {
    try {
        const {minTariff, maxTariff, gstPercentage} =  req.body;
        const data = new GST({
            minTariff: minTariff,
            maxTariff: maxTariff,
            gstPercentage: gstPercentage
        });

        const duplicate = await GST.find({isEnable: true, minTariff, maxTariff}).exec();
        if (duplicate.length !== 0) return res.status(409).send("GST already exists!");

        const resAdd = await data.save();
        if (!resAdd) return res.status(400).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }        
}


//handel update gst
//query string : gst Id
//body : { "minTariff" : 0, "maxTariff" : 0, "gstPercentage" : 0 }
const handelUpdate = async (req, res) => {
    try {
        const {_id} = req.params;
        const {minTariff, maxTariff, gstPercentage} =  req.body;
        const data = await GST.findOne({isEnable: true, _id}).exec();
        if (!data) return res.status(404).send();

        const duplicate = await GST.find({_id, isEnable: true}).exec();
        if (duplicate.length > 0) {
            duplicate.map((item) => {
                if (item._id.toString() !== _id) {
                    return res.status(409).send("GST already exists!");
                }
            })
        }

        const resUpdate = await GST.findByIdAndUpdate(_id, {minTariff, maxTariff, gstPercentage}).exec();
        if (!resUpdate) return res.status(400).send(resUpdate);

        return res.status(200).send(resUpdate);
    } catch(e) {
        return res.status(500).send(e);
    }
}


//handel delete gst
//query string : gst Id
const handelRemove = async (req, res) => {
    try {
        const {_id} = req.params;
        const data = await GST.findOne({_id, isEnable: true}).exec();
        if (!data) return res.status(404).send();

        const resDelete = await GST.findByIdAndUpdate(_id, {isEnable: false}).exec();
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