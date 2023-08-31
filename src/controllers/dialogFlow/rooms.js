const Room = require("../../models/rooms");
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const myProjectId = "hotellivebot-hwtb";

async function getEmptyRooms(projectId = myProjectId) {
    // A unique identifier for the given session
    const sessionId = uuid.v4();
  
    // Create a new session
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );
  
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          startDate: '01/01/1971',
          // The language used by the client (en-US)
          noOfDaysToStay: '3',
        },
      },
    };
  

    let data = [];

    data = await Room.find({hotelId, isEnable: true})
    .sort("no")                                
    .select("hotelId categoryId _id no accommodation guestId guestCount tariff maxDiscount extraBedTariff extraPersonTariff isOccupied");

    if (data) {
        if (data.length){
            true
        }
        false
    }

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    
    // console.log('Detected intent');
    // const result = responses[0].queryResult;
    // console.log(`  Query: ${result.queryText}`);
    // console.log(`  Response: ${result.fulfillmentText}`);
    // if (result.intent) {
    //   console.log(`  Intent: ${result.intent.displayName}`);
    // } else {
    //   console.log('  No intent matched.');
    // }
  }

//handel search room
//query string : hotel Id?option=O occupied else all &search= room no
const handelSearch = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const option = req.query.option;
        const search = req.query.search;
        let data = [];

        if (option === "O") {
            data = await Room.find({hotelId, isEnable: true, isOccupied: true})
                                    .sort("no")                                
                                    .select("hotelId categoryId _id no accommodation guestId guestCount tariff maxDiscount extraBedTariff extraPersonTariff isOccupied");
        } else {   
            data = await Room.find({hotelId, isEnable: true})
                                        .sort("no")                                
                                        .select("hotelId categoryId _id no accommodation guestId guestCount tariff maxDiscount extraBedTariff extraPersonTariff isOccupied");
        }

        // if (!data) return res.status(404).send();

        if (search) {
            const filterData = await Room.find({hotelId, isEnable: true, no: {$regex: ".*" + search.trim().toUpperCase() + ".*"}})
                                                .sort("no")                                
                                                .select("hotelId categoryId _id no accommodation guestId guestCount tariff maxDiscount extraBedTariff extraPersonTariff isOccupied");
            if (!filterData) return res.status(404).send();

            return res.status(200).send(filterData);        
        }
    
        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};


//handel detail room
//query string : hotel Id / room Id
const handelDetail = async (req, res) => {
    try {
        const {hotelId, _id} = req.params;
        const data = await Room.findOne({hotelId, isEnable: true, _id});

        if (!data) return res.status(404).send();

        return res.status(200).send(data);
    } catch(e) {
        return res.status(500).send(e);
    }
};






module.exports = {
    handelSearch,
    handelDetail
};