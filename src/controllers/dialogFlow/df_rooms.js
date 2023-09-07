const { captureRejectionSymbol } = require("nodemailer/lib/xoauth2");
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

const handelGetPlace = async (agent) => {
  const place = agent.context.get("GetPlaceIntent").parameters["PlaceEntity"];
  console.log(place);
  const dataHotel = await Hotel.find({city: {$regex: place, $options: "i"}, isEnable: true}).select({_id: 1});
  console.log(dataHotel);

  dataHotel.length > 0 ? 
    agent.add(`GOOD! When are you arriving at #GetPlaceIntent.PlaceEntity : (i.e. Date in dd/mm/yyyy format)`) : 
    agent.add(`Sorry incorrect place. Please confirm the place you looking for (i.e.. Digha, Bokkhali, Darjeeling, Puri)`);
};

const handelGetStartDate = async (agent) => {
  const place = agent.context.get("GetPlaceIntent").parameters["PlaceEntity"];
  const startDate = agent.context.get("GetStartDateIntent").parameters["StartDate"];
  const dt = DateTime.ParseExact(startDate.ToString(), "MM/dd/yyyy hh:mm:ss tt", CultureInfo.InvariantCulture);
  const sd = dt.ToString("dd/M/yyyy", CultureInfo.InvariantCulture);
  
  const currentDate = new Date();
  const startDt = new Date(startDate);
  const difference = currentDate - startDt;
  const differenceDays = difference / (1000 * 60 * 60 * 24);

  differenceDays > 0 ? 
    agent.add(`GREAT! How long are you going to stay at ${place} (from ${sd} to no. of days)`) :
    agent.add(`Sorry! It is too early. Please try to book before 1 day. Try again.`);
};

const handelRoomEnquiry = async (agent) => {
    const city = agent.context.get("GetPlaceIntent").parameters["PlaceEntity"];
    const start_date = agent.context.get("GetStartDateIntent").parameters["StartDate"];
    const no_of_days = agent.context.get("GetNoOfDayToStayIntent").parameters["NoOfDayToStay"];
    const no_of_borders = agent.context.get("GetBorderCountIntent").parameters["BorderCount"];

    // console.log(start_date);
    // console.log(no_of_days_to_stay);
    
    const dataHotel = await Hotel.find({city: city, isEnable: true}).select({_id: 1});
    
    if (dataHotel.length > 0) {
      const dataRoom = await Room.find({hotelId: dataHotel._id, isEnable: true, isOccupied: false});
      
      let isAvailable = false;

      if (dataRoom) {
          if (dataRoom.length) {
              isAvailable = true;
          }
      }
    }

    if (isAvailable) {
      // const response = 
      // {
      //   "richContent": [
      //     [
      //       {
      //         "type": "chips",
      //         "options": [
      //           {
      //             "mode": "blocking",
      //             "text": "Chip 1"
      //           },
      //           {
      //             "text": "Chip 2"
      //           }
      //         ]
      //       }
      //     ]
      //   ]
      // };

      // agent.add(new dfff.Payload(agent.UNSPECIFIED, response, { rawPayload: true, sendAsMessage: true}));

      agent.add(`GERAT! we have room availability. Prices are as follows per day +GST`);    
    } else {
      agent.add(`SORRY, we have dosen't have any room avaliable.`);    
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
  handelGetPlace,
  handelGetStartDate,
  handelRoomEnquiry,
  handelRoomBooking,
  handelPaymentRealising,
  handelCancellation
};