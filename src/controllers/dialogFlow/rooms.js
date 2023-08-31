const Room = require("../../models/rooms");
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

const myProjectId = "hotellivebot-hwtb";

async function handelSearch(projectId = myProjectId) {
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

    const data = await Room.find({hotelId, isEnable: true, isOccupied: false});
    let isAvailable = false;

    if (data) {
        if (data.length){
            isAvailable = true;
        }
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