const mongoose = require("mongoose");
const Hotel = require("../../models/hotels");
const Category = require("../../models/roomCategories");
const Room = require("../../models/rooms");
const GuestRoomTransaction = require("../../models/guestRoomsTransaction");
const { Payload, Suggestion, Card, Image } = require("dialogflow-fulfillment");

class chatType {
  constructor(hotelId = "", hotel = "", startDate = "", endDate = "", dayCount = 0, categoryId = "", category = "", tariff = "") {
    this.hotelId = hotelId,
    this.hotel = hotel,
    this.startDate = startDate,
    this.endDate = endDate,
    this.dayCount = dayCount,
    this.categoryId = categoryId,
    this.category = category,  
    this.tariff = tariff
  };
};

let chatDictionary = {};

const handelHotelDemo = async (agent) => {
  console.log("handelDemo");

  try {
    //add text
    agent.add("This is text test.");
    
    //add suggestion clip
    agent.add(new Suggestion("1. Suggestion"));
    agent.add(new Suggestion("2. Suggestion"));
    agent.add(new Suggestion("3. Suggestion"));

    // add image 
    agent.add(new Image({
      imageUrl: 'https://s3.ap-south-1.amazonaws.com/emaillive.in/images/pixel_logo.png',
      accessibilityText: 'This is the description of the image',
    }));

    // add media card
    agent.add(new Card({
      title: `Title: this is a card title`,
      text: `This is the body text of a card. You can even use line breaks and emoji! \uD83D\uDC81`,
      buttonText: 'Click me',
      buttonUrl: 'https://s3.ap-south-1.amazonaws.com/emaillive.in/images/pixel_logo.png'
    }));

    // end context
    agent.end("ok bye");
  } catch (e) {
    console.log(e)
  };

  // const payload = {
  //   richContent: [
  //     [
  //       {
  //         type: "info",
  //         title: "GERAT! we got rooms as your requirement.",
  //         subtitle: "Please select your option from the list as follows :"
  //       }
  //     ]
  //   ]
  // };

  // agent.add(new Payload(agent.UNSPECIFIED, payload, {rawPayload: true, sendAsMessage: true}));
};

// Start
// Initial menu
const handelHotelWelcome = async (agent) => {
  let isOldSession = false;

  try {
    const sessionId = agent.session.split("/").pop();
    
    for(var key in chatDictionary) {
      if (key === sessionId) {
        isOldSession = true;
      }
    }

    if (!isOldSession) {
      chatDictionary[sessionId] = new chatType();
    }

    const fulfillment = `*Welcome to HotelLive!* 👨‍💼\nI can take care of all your hotel booking needs.\n\nWhat do you like to know (Room Booking or Room Enquiry)?`;
    agent.add(fulfillment);

    agent.add(new Suggestion("Room Booking"));
    agent.add(new Suggestion("Room Enquiry"));
  } catch (e) {
    console.log(e);
  }
};
// Initial menu
// End

const handelHotelPlaceList = async (agent) => {
  let places = "";
  let placeArr = [];

  try {
    const dbHotel = await Hotel.find({isEnable: true});
  
    await Promise.all(dbHotel.map(async (hotel) => {
      placeArr.push(hotel.city);

      if (places.length === 0) {
        places = `*${hotel.city}*`;
      } else {
        places = places + ', *' + hotel.city + '*';
      }
    }));

    const fulfillment = `Pleas select the place of your visit (i.e., ${places})?`;
    agent.add(fulfillment);

    await Promise.all(placeArr.map((item) => {
      agent.add(new Suggestion(`${item}`));
    }));
  } catch (e) {
    console.log(e);
  }
}

const handelHotelSetPlace = async (agent) => {
  let fulfillment = "";

  try {
    const sessionId = agent.session.split("/").pop();
    const hotel = agent.parameters["place"];
    const dbHotel = await Hotel.findOne({city: {$regex: hotel, $options: "i"}, isEnable: true}).select({_id: 1});
    
    if (dbHotel) {
      const hotelId = dbHotel._id;

      chatDictionary[sessionId].hotelId = hotelId;
      chatDictionary[sessionId].hotel = hotel;

      fulfillment = `*OK!* When are you going to visit at *${hotel}*\n(i.e. first date in mm/dd/yyyy format)?`;
    } else {
      fulfillment = `*SORRY!* incorrect place\nPlease confirm the place you looking for (i.e.. *Digha*, *Bokkhali*, *Darjeeling*, *Puri*)`;
    }

    agent.add(fulfillment);
  } catch (e) {
    console.log(e);
  }
};

const handelHotelSetStartDate = async (agent) => {
  let fulfillment = "";

  try {
    const sessionId = agent.session.split("/").pop();
    const startDate = agent.parameters["start-date"];
    const currentDate = new Date();
    const arrivalDate = new Date(startDate);
    const difference = arrivalDate - currentDate;
    const differenceDays = difference / (1000 * 60 * 60 * 24);

    if (differenceDays > 0) {
      chatDictionary[sessionId].startDate = arrivalDate;
      fulfillment = `*GREAT!* How long are you going to stay at *${chatDictionary[sessionId].hotel}* from *${formatDateDDMMMMYYYY(chatDictionary[sessionId].startDate)}* to (no. of days)?`;
    } else {
      fulfillment = `*SORRY!* it is too early\nPlease try to book before 1 day. Try again.`;
    }

    agent.add(fulfillment);

    agent.add(new Suggestion(`1 day`));
    agent.add(new Suggestion(`2 days`));
    agent.add(new Suggestion(`3 days`));
  } catch (e) {
    console.log(e);
  };    
};

const handelHotelSetDayCount = async (agent) => {
  let categories = "";
  let catigoryArr = [];
  let fulfillment = "";

  try {
    const sessionId = agent.session.split("/").pop();
    const dayCount = agent.parameters["day-count"];
    
    if (dayCount > 0) {
      let endDate = new Date();                                
      endDate.setDate(chatDictionary[sessionId].startDate.getDate() + dayCount);

      chatDictionary[sessionId].dayCount = dayCount;
      chatDictionary[sessionId].endDate = endDate;

      const dbCategory = await Category.find({hotelId: mongoose.Types.ObjectId(chatDictionary[sessionId].hotelId), 
        isEnable: true});

      await Promise.all(dbCategory.map(async (category) => {
        catigoryArr.push(`${category.name} - Rs.${category.tariff - category.maxDiscount}/-`);

        if (categories.length === 0) {
          categories = `*${category.name} - Rs.${category.tariff - category.maxDiscount}/-*`;
        } else {
          categories = categories + `, *${category.name} - Rs.${category.tariff - category.maxDiscount}/-*`;
        }
      }));

      fulfillment = `*OWOW!* Let me know the kind of room you are looking for (i.e., ${categories}) at *${chatDictionary[sessionId].hotel}* form *${formatDateDDMMMMYYYY(chatDictionary[sessionId].startDate)}* to next *${dayCount}* day(s)?`;
      agent.add(fulfillment);

      await Promise.all(catigoryArr.map((item) => {
        agent.add(new Suggestion(`${item}`));
      }));
    } else {
      fulfillment = `*SORRY!* it is too early\nPlease try to book before for at list 1 day. Try again.`;
      agent.add(fulfillment);
    }
  } catch (e) {
    console.log(e);
  }
};

const handelHotelSetRoomCategory = async (agent) => {
  let fulfillment = "";

  try {
    const sessionId = agent.session.split("/").pop();
    const category = agent.parameters["category"];
    
    if (category.length > 0) {
      const categoryId = await getRoomCategoryFromName(chatDictionary[sessionId].hotelId, category);
      
      chatDictionary[sessionId].category = category;
      chatDictionary[sessionId].categoryId = categoryId;

      fulfillment = `GREAT! you are looking for *${category}* room(s) at *${chatDictionary[sessionId].hotel}* from *${formatDateDDMMMMYYYY(chatDictionary[sessionId].startDate)}* to next *${chatDictionary[sessionId].dayCount}* day(s).\nIs it correct (i.e. Yes / No)?`;
      agent.add(fulfillment);
      agent.add(new Suggestion(`Yes`));
      agent.add(new Suggestion(`No`));
    } else {
      fulfillment = `*SORRY!* no room category selected\nPlease try again.`;
      agent.add(fulfillment);
    }
  } catch (e) {
    console.log(e);
  }    
};

const handelHotelSetRoomCategoryFollowupYes = async (agent) => {
  let isAvailable = false;
  let fulfillment = "";

  try {
    const sessionId = agent.session.split("/").pop();
    const dbRoom = await Room.find({hotelId: {$regex: chatDictionary[sessionId].hotelId, $options: "i"}, 
                                      categoryId: {$regex: chatDictionary[sessionId].categoryId, $options: "i"}, 
                                      isEnable: true});

    await Promise.all(dbRoom.map(async (room) => {
        const dbAvailable = await GuestRoomTransaction.find({hotelId: {$regex:chatDictionary[sessionId].hotelId, $options: "i"},
          id: {$regex: room._id, $options: "i"},
          occupancyDate: {
            $gte: new Date(chatDictionary[sessionId].startDate).toISOString(),
            $lte: new Date(chatDictionary[sessionId].endDate).toISOString()
          }});

          if (dbAvailable.length === 0) {
            isAvailable = true;
            return;
          }
    }));

    if (isAvailable) {
      fulfillment = `*CONGRATULATION!* we have room(s) of your choice.\nPlease click the following link to complete the booking process.`;
      agent.add(fulfillment);
    } else {
      fulfillment = `*SORRY!*\nwe dosen't have any room avaliable. Do you like to change the dates? (Yes / No)`;
      agent.add(fulfillment);
      agent.add(new Suggestion(`Yes`));
      agent.add(new Suggestion(`No`));
    }
  } catch (e) {
    console.log(e);
  }    
};

const handelHotelSetRoomCategoryFollowupNo = async (agent) => {
  let places = "";
  let placeArr = [];
  let fulfillment = "";

  try {
    const sessionId = agent.session.split("/").pop();
    const dbHotel = await Hotel.find({isEnable: true});
  
    await Promise.all(dbHotel.map(async (hotel) => {
      placeArr.push(hotel.city);

      if (places.length === 0) {
        places = `*${hotel.city}*`;
      } else {
        places = places + ', *' + hotel.city + '*';
      }
    }));

    fulfillment = `SORRY, then we can start it again. Please tell me about your destination, we have hotels at (i.e., ${places}). Now please confirm your destination.`;
    agent.add(fulfillment);

    await Promise.all(placeArr.map((item) => {
      agent.add(new Suggestion(`${item}`));
    }));
  } catch (e) {
    console.log(e);
  }    
};


// const handelHotelRoomEnquiry = async (agent) => {
//   let fulfillment = "";
//   let isAvailable = false;
//   let categoryList = [];
//   let categoryDisplay = [];

//   try {
//     const place = agent.context.get("set.place").parameters["place"];
//     const startDate = agent.context.get("set.start.date").parameters["start-date"];
//     const dayCount = agent.context.get("set.day.count").parameters["day-count"];
//     const borderCount = agent.context.get("get.border.count").parameters["border-count"];

//     const dbHotel = await Hotel.findOne({city: {$regex: place, $options: "i"}, isEnable: true});

//     if (dbHotel) {
//       const dbRooms = await Room.find({hotelId: mongoose.Types.ObjectId(dbHotel._id), 
//                                       accommodation : {$eq: borderCount},
//                                       isEnable: true});
                                      
//       if (dbRooms) {
//         await Promise.all(dbRooms.map(async (room) => {
//           let isOccupied = false;

//           for(let i = 0; i < dayCount - 1; i++) {
//             const bookingDate = new Date(startDate);
//             bookingDate.setDate(bookingDate.getDate() + i);

//             const dbAvalibality = await GuestRoomTransaction.findOne({hotelId: mongoose.Types.ObjectId(dbHotel._id), 
//                                                                   id: mongoose.Types.ObjectId(room._id),
//                                                                   occupancyDate: {$eq: bookingDate}});

//             if (dbAvalibality) { isOccupied = true; }
//           }  

//           if (!isOccupied) {
//             let isFound = false;

//             categoryList.map((item) => {
//               if (mongoose.Types.ObjectId(item.categoryId) === mongoose.Types.ObjectId(room.categoryId)) {
//                 isFound = true;
//               }
//             })

//             if (!isFound) {
//               categoryList.push(new categoryType(
//                                                   room.categoryId, 
//                                                   await getRoomCategoryFromId(room.categoryId), 
//                                                   room.tariff));
//             }
//           }
//         }));

//         if (categoryList.length > 0) {
//           let idx = 0;                              
//           categoryList.map(async (category) => {
//             idx++;
//             categoryDisplay.push([{
//                                   type: "info",
//                                   title: `${idx}. ${category.category}`,
//                                   subtitle: `Tariff : Rs. ${category.tariff}/day +GST`
//                                  },
//                                  {
//                                     type: "chips",
//                                     options: [
//                                       {
//                                         mode: "blocking",
//                                         text: `Brochier ${category.category}`,
//                                       },
//                                       {
//                                         mode: "blocking",
//                                         text: `Book ${category.category}`,
//                                         anchor: {
//                                           "href": "https://hotel.wikitoria.in/book/room/hotelId/roomCayegoryId/startDate/dayCount/guestCount"
//                                         }
//                                       }
//                                     ]
//                                  }]);
//           });

//           isAvailable = true;
//         }
//       }
//     }

//     // const positivePayload = {
//     //   richContent: [
//     //     [
//     //       {
//     //         type: "info",
//     //         title: "GERAT! we got rooms as your requirement.",
//     //         subtitle: "Please select your option from the list as follows :"
//     //       }
//     //     ],
//     //     ...categoryDisplay
//     //   ]
//     // };


//     if (isAvailable) { 
//       fulfillment = `*GERAT!* we got rooms as your requirement.\nPlease select your option from the list as follows :`;
//       //agent.add(new Payload(agent.UNSPECIFIED, positivePayload, {rawPayload: true, sendAsMessage: true})) :
//     } else {
//       //agent.add(new Payload(agent.UNSPECIFIED, negativePayload, {rawPayload: true, sendAsMessage: true}));
//       fulfillment = `*SORRY!*\nwe have dosen't have any room avaliable. Please try it fro start. Hotel place?`;
//       agent.add(fulfillment);

//     }

//   } catch (e) {
//     console.log(e);
//   }
// };

// const handelHotelRoomCategoryBrochier = async (agent) => {
//   try {
//     const place = agent.context.get("set.place").parameters["geo-city"];
//     const category = agent.context.get("get.room.category.brochier").parameters["category"];

//     let isAvailable = false;
//     let imageDisplay = [];

//     const dbHotel = await Hotel.findOne({city: {$regex: place, $options: "i"}, isEnable: true});

//     if (dbHotel) {
//       const dbCategory = await Category.find({hotelId: mongoose.Types.ObjectId(dbHotel._id), 
//                                                       name: {$regex: category, $options: "i"}, 
//                                                       isEnable: true});
                      
//       await Promise.all(dbCategory.map(async (category) => {
//         await Promise.all(category.images.map(async (image) => {
//           isAvailable = true;

//           // imageDisplay.push({
//           //   type: "image",
//           //   // rawUrl: `https://6a16-103-88-217-89.ngrok-free.app/images/${image.image}`,
//           //   rawUrl: "https://icon-library.com/images/icon-for-files/icon-for-files-0.jpg",
//           //   accessibilityText: image.description
//           // });
//         }));
//       }));
//     }

//     // const positivePayload = {
//     //     richContent: [
//     //       [{
//     //         "type": "info",
//     //         "title": `${category}`
//     //       }],
//     //       [...imageDisplay],
//     //       // [
//     //       //   {
//     //       //     type: "button",
//     //       //     icon: {
//     //       //       type: "chevron_right",
//     //       //       color: "#FF9800"
//     //       //     },
//     //       //     mode: "blocking",
//     //       //     text: `Book ${category}`,
//     //       //     "anchor": {
//     //       //       "href": "https://stackoverflow.com/questions/23714383/what-are-all-the-possible-values-for-http-content-type-header"
//     //       //     },
//     //       //     // event: {
//     //       //     //   event: "BookRoomIntent"
//     //       //     // }
//     //       //   }
//     //       // ]
//     //       [{
//     //         type: "chips",
//     //         options: [
//     //           {
//     //             mode: "blocking",
//     //             text: `Book ${category}`,
//     //             anchor: {
//     //               "href": "https://www.carwale.com"
//     //             }
//     //           }
//     //         ]
//     //      }]
//     //     ]
//     //   };

//     // const negativePayload = {
//     //   richContent: [
//     //     [
//     //       {
//     //         type: "info",
//     //         title: "SORRY!",
//     //         subtitle: "we dosen't have any images for the brochier."
//     //       }
//     //     ]
//     //   ]
//     // };

//     isAvailable ? 
//       agent.add(new Payload(agent.UNSPECIFIED, positivePayload, {rawPayload: true, sendAsMessage: true})) :
//       agent.add(new Payload(agent.UNSPECIFIED, negativePayload, {rawPayload: true, sendAsMessage: true}));
//   } catch (e) {
//     console.log(e);
//   }
// };

// const handelRoomBooking = async (agent) => {
//   agent.add(`Your room is alloted but confirmation will be done after realising the payment.`);    
// };

// const handelPaymentRealising = async (agent) => {
//   agent.add(`We have realize your payment successfully. Your receipt no. {receipt no} `);    
// };

// const handelCancellation = async (agent) => {
//   const phone = agent.context.get("roomenquiryintent-followup").parameters["phone"];
//   const booking_no = agent.context.get("roomenquiryintent-followup").parameters["booking_no"];

//   agent.add(`We have received your cancellation request. Your booking will be cancelled and payment will be realised to you within 3 working days.`);    
// };

const handelHotelQuit = async (agent) => {
  const sessionId = agent.session.split("/").pop();

  delete chatDictionary[sessionId];
  agent.end("Ok, Buy for now!");
}



async function getRoomCategoryFromName(hotelId, name) {
  try {
    const dbCategory = await Category.findOne({hotelId: mongoose.Types.ObjectId(hotelId), 
      name: {$regex: name, $options: "i"},
      isEnable: true}).select({_id: 1});

    if (dbCategory) {
      return dbCategory._id;
    }
  } catch (e) {
    console.log(e);
  };        

  return "";
}


// async function getRoomCategoryFromId(id) {
//   let name = "";

//   try {
//     const dbCategory = await Category.findOne({_id: mongoose.Types.ObjectId(id), isEnable: true}).select({name: 1});
//     if (dbCategory) {
//       name = dbCategory.name;
//     }
//   } catch (e) {
//     return name;
//   };        

//   return name;
// }

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

// function formatDateYYYYMMDD(date) {
//   try {
//     var d = new Date(date),
//         month = '' + (d.getMonth() + 1),
//         day = '' + d.getDate(),
//         year = d.getFullYear();

//     if (month.length < 2) 
//         month = '0' + month;
//     if (day.length < 2) 
//         day = '0' + day;

//     return [year, month, day].join('-');
//   } catch (e) {
//     return date;
//   }
// }



module.exports = {
  handelHotelDemo,
  handelHotelWelcome,
  handelHotelPlaceList,
  handelHotelSetPlace,
  handelHotelSetStartDate,
  handelHotelSetDayCount,
  handelHotelSetRoomCategory,
  handelHotelSetRoomCategoryFollowupYes,
  handelHotelSetRoomCategoryFollowupNo,
  // handelHotelRoomEnquiry,
  // handelHotelRoomCategoryBrochier,
  // handelRoomBooking,
  // handelPaymentRealising,
  // handelCancellation
  handelHotelQuit
};