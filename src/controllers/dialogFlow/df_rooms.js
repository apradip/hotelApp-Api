const Hotel = require("../../models/hotels");
const Room = require("../../models/rooms");
const dfff = require('dialogflow-fulfillment');

const hotelId = "64252efb369c403b60effae8";

const handelDemo = async (agent) => {
  agent.add("Sending response from Webhook server as v1.1.11.5");
};

const handelPlaceList = async (agent) => {
    const data = await Hotel.find({isEnable: true}).select({city: 1, _id: 0}).sort({city: 1});

    agent.add(`Please choose a place`);
    for (var entry of map.data()) {
      agent.add(new Suggestion(entry.city));
    }
};

const handelRoomEnquiry = async (agent) => {
    const place = agent.context.get("roomenquiryintent-followup").parameters["place"];
    const start_date = agent.context.get("roomenquiryintent-followup").parameters["startdate"];
    const end_date = agent.context.get("roomenquiryintent-followup").parameters["enddate"];
    const no_of_border = agent.context.get("roomenquiryintent-followup").parameters["noofboder"];

    // console.log(start_date);
    // console.log(no_of_days_to_stay);
    
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

const handelRoomBooking = async (agent) => {
  const place = agent.context.get("roomenquiryintent-followup").parameters["place"];
  const start_date = agent.context.get("roomenquiryintent-followup").parameters["startdate"];
  const end_date = agent.context.get("roomenquiryintent-followup").parameters["enddate"];
  const no_of_border = agent.context.get("roomenquiryintent-followup").parameters["noofboder"];
  const name = agent.context.get("roomenquiryintent-followup").parameters["name"];
  const phone = agent.context.get("roomenquiryintent-followup").parameters["phone"];
  
  agent.add(`Your room is alloted but confirmation will be done after realising the payment.`);    
};

const handelPaymentRealising = async (agent) => {
  agent.add(`We have realize your payment successfully. Your receipt no. {receipt no} `);    
};

const handelCancellation = async (agent) => {
  const phone = agent.context.get("roomenquiryintent-followup").parameters["phone"];
  const booking_no = agent.context.get("roomenquiryintent-followup").parameters["booking_no"];

  agent.add(`We have received your cancellation request. Your booking will be cancelled and payment will be realised to you within 3 working days.`);    
};

module.exports = {
  handelDemo,
  handelPlaceList,
  handelRoomEnquiry,
  handelRoomBooking,
  handelPaymentRealising,
  handelCancellation
};