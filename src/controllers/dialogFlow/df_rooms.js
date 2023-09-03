const Room = require("../../models/rooms");
const dfff = require('dialogflow-fulfillment');

const hotelId = "64252efb369c403b60effae8";

const handelDemo = async (agent) => {
  agent.add("Sending response from Webhook server as v1.1.11.5");
};


const handelRoomEnquiry = async (agent) => {
    const start_date = agent.context.get("roomenquiryintent-followup").parameters['startdate'];
    const no_of_days_to_stay = agent.context.get("roomenquiryintent-followup").parameters['noofdays'];

    console.log(start_date);
    console.log(no_of_days_to_stay);
    
    const data = await Room.find({hotelId, isEnable: true, isOccupied: false});
    let isAvailable = false;

    if (data) {
        if (data.length) {
            isAvailable = true;
        }
    }

    if (isAvailable) {
      const response = 
      {
        "richContent": [
          [
            {
              "type": "chips",
              "options": [
                {
                  "mode": "blocking",
                  "text": "Chip 1"
                },
                {
                  "text": "Chip 2"
                }
              ]
            }
          ]
        ]
      };

      // agent.add(new dfff.Payload(agent.UNSPECIFIED, response, { rawPayload: true, sendAsMessage: true}));

      agent.add(`Hello, great news we have ${data.length} rooms avaliable`);    
    } else {
      agent.add(`Sorry, we have no room on that time`);    
    }
};


module.exports = {
  handelDemo,
  handelRoomEnquiry
};