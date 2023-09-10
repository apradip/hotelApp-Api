const mongoose = require("mongoose");
const Hotel = require("../../models/hotels");
const RoomCategory = require("../../models/roomCategories");
const Room = require("../../models/rooms");
const GuestRoomTransaction = require("../../models/guestRoomsTransaction");
const { Payload } = require("dialogflow-fulfillment");

class categoryType {
  constructor(categoryId = "", category = "", tariff = "") {
    this.categoryId = categoryId,
    this.category = category,  
    this.tariff = tariff
  };
};

const handelDemo = async (agent) => {
  console.log("handelDemo");
  agent.add("Sending response from Webhook server as v2.1.1");
};

const handelPlaceList = async (agent) => {
  try {
    const dbHotel = await Hotel.find({isEnable: true});
    let placeDisplay = [];

    await Promise.all(dbHotel.map(async (hotel) => {
      placeDisplay.push({
                          mode: "blocking",
                          text: hotel.city});
    }));

    const listPayload = {
      richContent: [
        [
          {
            type: "info",
            title: "Pleas select the place of your visit",
          },
          {
            type: "chips",
            options: placeDisplay
          }
        ]
      ]
    };

    agent.add(new Payload(agent.UNSPECIFIED, listPayload, {rawPayload: true, sendAsMessage: true}));
  } catch (e) {
    const errorPayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY! some error occure",
            subtitle: "Plase start fro start."
          }
        ]
      ]
    };

    agent.add(new Payload(agent.UNSPECIFIED, errorPayload, {rawPayload: true, sendAsMessage: true}));
  };
}

const handelGetPlace = async (agent) => {
  try {
    const place = agent.context.get("getplaceintent").parameters["geo-city"];
    const dbHotel = await Hotel.findOne({city: {$regex: place, $options: "i"}, isEnable: true}).select({_id: 1});

    const positivePayload = {
      richContent: [
        [
          {
            type: "info",
            title: `OK! When are you going to visit at ${place}`,
            subtitle: "(i.e. first date in mm/dd/yyyy format)"
          }
        ]
      ]
    };

    const negativePayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY! incorrect place",
            subtitle: "Please confirm the place you looking for (i.e.. Digha, Bokkhali, Darjeeling, Puri)"
          }
        ]
      ]
    };
    
    dbHotel ? 
      agent.add(new Payload(agent.UNSPECIFIED, positivePayload, {rawPayload: true, sendAsMessage: true})) :
      agent.add(new Payload(agent.UNSPECIFIED, negativePayload, {rawPayload: true, sendAsMessage: true}));
  } catch (e) {
    const errorPayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY! some error occure",
            subtitle: "Please confirm the place you looking for (i.e.. Digha, Bokkhali, Darjeeling, Puri)"
          }
        ]
      ]
    };

    agent.add(new Payload(agent.UNSPECIFIED, errorPayload, {rawPayload: true, sendAsMessage: true}));
  };
};

const handelGetStartDate = async (agent) => {
  try {
    const place = agent.context.get("getplaceintent").parameters["geo-city"];
    const startDate = agent.context.get("getstartdateintent").parameters["start-date"];
    const sd = formatDateDDMMMMYYYY(startDate);
    const currentDate = new Date();
    const arrivalDate = new Date(startDate);
    const difference = arrivalDate - currentDate;
    const differenceDays = difference / (1000 * 60 * 60 * 24);

    const positivePayload = {
      richContent: [
        [
          {
            type: "info",
            title: `GREAT! How long are you going to stay at ${place} from ${sd}`,
            subtitle: "(no. of days)"
          }
        ]
      ]
    };

    const negativePayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY! it is too early",
            subtitle: "Please try to book before 1 day. Try again."
          }
        ]
      ]
    };

    differenceDays > 0 ? 
      agent.add(new Payload(agent.UNSPECIFIED, positivePayload, {rawPayload: true, sendAsMessage: true})) :
      agent.add(new Payload(agent.UNSPECIFIED, negativePayload, {rawPayload: true, sendAsMessage: true}));
  } catch (e) {
    const errorPayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY! some error occure",
            subtitle: "Please try to book before 1 day. Try again."
          }
        ]
      ]
    };

    agent.add(new Payload(agent.UNSPECIFIED, errorPayload, {rawPayload: true, sendAsMessage: true}));
  };    
};

const handelGetNoOfDays = async (agent) => {
  try {
    const place = agent.context.get("getplaceintent").parameters["geo-city"];
    const startDate = agent.context.get("getstartdateintent").parameters["start-date"];
    const dayCount = agent.context.get("getnoofdaytostayintent").parameters["day-count"];
    const sd = formatDateDDMMMMYYYY(startDate);

    const positivePayload = {
      richContent: [
        [
          {
            type: "info",
            title: `OWOW! Let me know no. of person(s) will accompany you at ${place} form ${sd} to next ${dayCount} day(s)`,
            subtitle: "(no. of guests)"
          }
        ]
      ]
    };

    const negativePayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY! it is too early",
            subtitle: "Please try to book before for at list 1 day. Try again."
          }
        ]
      ]
    };

    dayCount > 0 ? 
      agent.add(new Payload(agent.UNSPECIFIED, positivePayload, {rawPayload: true, sendAsMessage: true})) :
      agent.add(new Payload(agent.UNSPECIFIED, negativePayload, {rawPayload: true, sendAsMessage: true}));
  } catch (e) {
    const errorPayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY! some error occure",
            subtitle: "Please try to book before 1 day. Try again."
          }
        ]
      ]
    };

    agent.add(new Payload(agent.UNSPECIFIED, errorPayload, {rawPayload: true, sendAsMessage: true}));
  };    
};

const handelGetNoOfBoders = async (agent) => {
  try {
    const place = agent.context.get("getplaceintent").parameters["geo-city"];
    const startDate = agent.context.get("getstartdateintent").parameters["start-date"];
    const dayCount = agent.context.get("getnoofdaytostayintent").parameters["day-count"];
    const borderCount = agent.context.get("getbordercountintent").parameters["border-count"];
    const sd = formatDateDDMMMMYYYY(startDate);

    const positivePayload = {
      richContent: [
        [
          {
            type: "info",
            title: `GREAT! you are looking for room(s) at ${place} from ${sd} to next ${dayCount} day(s), for ${borderCount} person(s).`,
            subtitle: "Is it correct? (yes / no)"
          },
          {
            type: "chips",
            options: [
              {
                mode: "blocking",
                text: "Yes",
              },
              {
                mode: "blocking",
                text: "No",
              }
            ]
          }
        ]
      ]
    };

    const negativePayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY! it is less person",
            subtitle: "Please try to stay 1 or more. Try again."
          }
        ]
      ]
    };

    dayCount > 0 ? 
      agent.add(new Payload(agent.UNSPECIFIED, positivePayload, {rawPayload: true, sendAsMessage: true})) :
      agent.add(new Payload(agent.UNSPECIFIED, negativePayload, {rawPayload: true, sendAsMessage: true}));
  } catch (e) {
    const errorPayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY! some error occure",
            subtitle: "Please try to stay with 1 or more. Try again."
          }
        ]
      ]
    };

    agent.add(new Payload(agent.UNSPECIFIED, errorPayload, {rawPayload: true, sendAsMessage: true}));    
  };    
};

const handelRoomEnquiry = async (agent) => {
  try {
    const place = agent.context.get("getplaceintent").parameters["geo-city"];
    const startDate = agent.context.get("getstartdateintent").parameters["start-date"];
    const dayCount = agent.context.get("getnoofdaytostayintent").parameters["day-count"];
    const borderCount = agent.context.get("getbordercountintent").parameters["border-count"];

    let isAvailable = false;
    let categoryList = [];
    let categoryDisplay = [];

    const dbHotel = await Hotel.findOne({city: {$regex: place, $options: "i"}, isEnable: true});

    if (dbHotel) {
      const dbRooms = await Room.find({hotelId: mongoose.Types.ObjectId(dbHotel._id), 
                                      accommodation : {$eq: borderCount},
                                      isEnable: true});
                                      
      if (dbRooms) {
        await Promise.all(dbRooms.map(async (room) => {
          let isOccupied = false;

          for(let i = 0; i < dayCount - 1; i++) {
            const bookingDate = new Date(startDate);
            bookingDate.setDate(bookingDate.getDate() + i);

            const dbAvalibality = await GuestRoomTransaction.findOne({hotelId: mongoose.Types.ObjectId(dbHotel._id), 
                                                                  id: mongoose.Types.ObjectId(room._id),
                                                                  occupancyDate: {$eq: bookingDate}});

            if (dbAvalibality) { isOccupied = true; }
          }  

          if (!isOccupied) {
            let isFound = false;

            categoryList.map((item) => {
              if (mongoose.Types.ObjectId(item.categoryId) === mongoose.Types.ObjectId(room.categoryId)) {
                isFound = true;
              }
            });

            if (!isFound) {
              categoryList.push(new categoryType(
                                                  room.categoryId, 
                                                  await getRoomCategoryFromId(room.categoryId), 
                                                  room.tariff));
            }
          }
        }));

        if (categoryList.length > 0) {
          let idx = 0;                              
          categoryList.map(async (category) => {
            idx++;
            categoryDisplay.push([{
                                  type: "info",
                                  title: `${idx}. ${category.category}`,
                                  subtitle: `Tariff : Rs. ${category.tariff}/day +GST`
                                 },
                                 {
                                    type: "chips",
                                    options: [
                                      {
                                        mode: "blocking",
                                        text: `Brochier ${category.category}`,
                                      },
                                      {
                                        mode: "blocking",
                                        text: `Book ${category.category}`,
                                        anchor: {
                                          "href": "https://hotel.wikitoria.in/book/room/hotelId/roomCayegoryId/startDate/dayCount/guestCount"
                                        }
                                      }
                                    ]
                                 }]);
          });

          isAvailable = true;
        }
      }
    }

    const positivePayload = {
      richContent: [
        [
          {
            type: "info",
            title: "GERAT! we got rooms as your requirement.",
            subtitle: "Please select your option from the list as follows :"
          }
        ],
        ...categoryDisplay
      ]
    };

    const negativePayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY!",
            subtitle: "we have dosen't have any room avaliable. Please try it fro start. Hotel place?"
          }
        ]
      ]
    };

    isAvailable ? 
      agent.add(new Payload(agent.UNSPECIFIED, positivePayload, {rawPayload: true, sendAsMessage: true})) :
      agent.add(new Payload(agent.UNSPECIFIED, negativePayload, {rawPayload: true, sendAsMessage: true}));
  } catch (e) {
    const errorPayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY! some error occure",
            subtitle: "Please confirm the place you looking for."
          }
        ]
      ]
    };

    agent.add(new Payload(agent.UNSPECIFIED, errorPayload, {rawPayload: true, sendAsMessage: true}));        
  };
};

const handelRoomCategoryBrochier = async (agent) => {
  try {
    const place = agent.context.get("getplaceintent").parameters["geo-city"];
    const category = agent.context.get("getroomcategorybrochierintent").parameters["category"];

    let isAvailable = false;
    let imageDisplay = [];

    const dbHotel = await Hotel.findOne({city: {$regex: place, $options: "i"}, isEnable: true});

    if (dbHotel) {
      const dbCategory = await RoomCategory.find({hotelId: mongoose.Types.ObjectId(dbHotel._id), 
                                                      name: {$regex: category, $options: "i"}, 
                                                      isEnable: true});
                      
      await Promise.all(dbCategory.map(async (category) => {
        await Promise.all(category.images.map(async (image) => {
          isAvailable = true;

          imageDisplay.push({
            type: "image",
            // rawUrl: `https://6a16-103-88-217-89.ngrok-free.app/images/${image.image}`,
            rawUrl: "https://icon-library.com/images/icon-for-files/icon-for-files-0.jpg",
            accessibilityText: image.description
          });
        }));
      }));
    }

    const positivePayload = {
        richContent: [
          [{
            "type": "info",
            "title": `${category}`
          }],
          [...imageDisplay],
          // [
          //   {
          //     type: "button",
          //     icon: {
          //       type: "chevron_right",
          //       color: "#FF9800"
          //     },
          //     mode: "blocking",
          //     text: `Book ${category}`,
          //     "anchor": {
          //       "href": "https://stackoverflow.com/questions/23714383/what-are-all-the-possible-values-for-http-content-type-header"
          //     },
          //     // event: {
          //     //   event: "BookRoomIntent"
          //     // }
          //   }
          // ]
          [{
            type: "chips",
            options: [
              {
                mode: "blocking",
                text: `Book ${category}`,
                anchor: {
                  "href": "https://www.carwale.com"
                }
              }
            ]
         }]
        ]
      };

    const negativePayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY!",
            subtitle: "we dosen't have any images for the brochier."
          }
        ]
      ]
    };

    isAvailable ? 
      agent.add(new Payload(agent.UNSPECIFIED, positivePayload, {rawPayload: true, sendAsMessage: true})) :
      agent.add(new Payload(agent.UNSPECIFIED, negativePayload, {rawPayload: true, sendAsMessage: true}));
  } catch (e) {
    console.log(e);

    const errorPayload = {
      richContent: [
        [
          {
            type: "info",
            title: "SORRY! some error occure",
            subtitle: "Please confirm the place you looking for."
          }
        ]
      ]
    };

    agent.add(new Payload(agent.UNSPECIFIED, errorPayload, {rawPayload: true, sendAsMessage: true}));        
  }
};

const handelRoomBooking = async (agent) => {
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




async function getRoomCategoryFromId(id) {
  let name = "";

  try {
    const dbCategory = await RoomCategory.findOne({_id: mongoose.Types.ObjectId(id), isEnable: true}).select({name: 1});
    if (dbCategory) {
      name = dbCategory.name;
    }
  } catch (e) {
    return name;
  };        

  return name;
}

function formatDateDDMMMMYYYY(date) {
  try {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = new Date(date);
    const day = "" + d.getDate();
    const monthName = monthNames[d.getMonth()];
    const year = "" + d.getFullYear();

    return  monthName + " - " + day + ", " + year;
  } catch (e) {
    return formatDate(date);
  };        
}

function formatDateYYYYMMDD(date) {
  try {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  } catch (e) {
    return date;
  }
}

module.exports = {
  handelDemo,
  handelPlaceList,
  handelGetPlace,
  handelGetStartDate,
  handelGetNoOfDays,
  handelGetNoOfBoders,
  handelRoomEnquiry,
  handelRoomCategoryBrochier,
  // handelRoomBooking,
  // handelPaymentRealising,
  // handelCancellation
};