const { Suggestion, Card, Payload } = require("dialogflow-fulfillment");
const { getSchoolDetail, getStaticsDetail, addSuggestion } = require("./google_sheet_school_helper");

// class chatType {
//   constructor(person = "", phone = "", suggestion = "") {
//     this.person = person,
//     this.phone = phone,
//     this.suggestion = suggestion
//   };
// };

// let chatDictionary = {};


// Start
// Initial menu
const handelSchoolWelcome = async (agent) => {
  // let isOldSession = false;

  try {
    // const sessionId = agent.session.split("/").pop();
    
    // for(var key in chatDictionary) {
    //   if (key === sessionId) {
    //     isOldSession = true;
    //   }
    // }

    // if (!isOldSession) {
    //   chatDictionary[sessionId] = new chatType();
    // }

    const fulfillment = `Welcome to SchoolLive! 🙏\n\nI'm happy to help you with all our West Bengal Govermnet school information.\n\nWhat do you like to know (Individual School info. / District Statics info. / Suggedtion)`;

    agent.add(fulfillment);
    agent.add(new Suggestion('School Info.'));
    agent.add(new Suggestion('District Statics'));
    agent.add(new Suggestion('Quit'));
  } catch (e) {
    console.log(e);
  };
};
// Initial menu
// End


// Start
// Individual School
const handelIndividualSchoolMenu = async (agent) => {
  try {
      const fulfillment = `Please enter the school's UDISE Code :`;
      agent.add(fulfillment);
  } catch (e) {
    console.log(e);
  };
};

const handelIndividualSchool = async (agent) => {
  try {
    // const sessionId = agent.session.split("/").pop();
    const udise = agent.parameters["udiseCode"];
    const res = await getSchoolDetail({ "SCHCD" : udise });

    if (res) {
      if (res.length === 0) {
        const fulfillment = `Invalid UDISE Code!😭\nPlease enter a correct UDISE Code :`;
        agent.add(fulfillment);

      } else {
        let fulfillment = `*Great !* 👍 
        \nSchool detail as follows :`;

        res.map((item) => {
          fulfillment = fulfillment + `\n\n*${item.SCHOOL_NAME}*\n${item.DISTRICT_NAME}\n${item.BLOCK_NAME}\n${item.VILLAGE_WARD_NAME}\n\nNo. of toilet(s) :\nBoys : ${item.TOILETB}, Girls : ${item.TOILETG}\n\nWater : ${item.WATER}\nHand pump : ${item.HAND_PUMP}\nWell port : ${item.WELL_PROT}\nTap water : ${item.TAP}\nPacket Water : ${item.PACK_WATER_FUN}\nHand wash : ${item.HANDWASH}\nElectricity : ${item.ELECT}\n\nPlayground : ${item.PGROUND}`
        });

        agent.add(fulfillment);
        agent.add(new Suggestion('School Info.'));
        agent.add(new Suggestion('District Statics'));
        agent.add(new Suggestion('Quit'));

      }
     } else {
      const fulfillment = `Invalid UDISE Code!😭\nPlease enter a correct UDISE Code :`;
      agent.add(fulfillment);

    }
  } catch (e) {
    console.log(e);
  };
};
// Individual School
// End


// Start
// Statical data
const handelDistrictStaticsMenu = async (agent) => {
  try {
      const fulfillment = `Please enter District name :`;
      agent.add(fulfillment);
  } catch (e) {
    console.log(e);
  };
};

const handelDistrictStatics = async (agent) => {
  // const sessionId = agent.session.split("/").pop();
  const district = agent.parameters["district"];
  const res = await getStaticsDetail({ "DISTRICT_NAME" : district });

  try {
    if (res) {
      if (res.length === 0) {
        const fulfillment = `Invalid District!😭\nPlease enter correct District name :`;
        agent.add(fulfillment);

      } else {
        var total = 0; 
        var class_4 = 0;
        var class_5 = 0;
        var class_8 = 0;
        var class_10 = 0;
        var class_12 = 0;
        var coed = 0;
        var girl = 0;
        var boy = 0;
        var toilet_b = 0;
        var toilet_g = 0;
        var water = 0;
        var hand_pump = 0;
        var whell_port = 0;
        var tap = 0;
        var pack_water = 0;
        var hand_wash = 0;
        var electricity = 0;
        var play_ground = 0;

        res.map((item) => {
          total = total + 1;

          if (item.CLASS_TO == "4") {
            class_4 = class_4 + 1;
          }
          else if (item.CLASS_TO == "5") {
            class_5 = class_5 + 1;          
          }
          else if (item.CLASS_TO == "8") {
            class_8 = class_8 + 1;          
          }
          else if (item.CLASS_TO == "10") {
            class_10 = class_10 + 1;          
          }
          else if (item.CLASS_TO == "12") {
            class_12 = class_12 + 1;          
          }

          if (item.SCHTYPE == "CO-ED") {
            coed = coed + 1;
          }
          else if (item.SCHTYPE == "GIRLS") {
            girl = girl + 1;          
          }
          else if (item.SCHTYPE == "BOYS") {
            boy = boy + 1;          
          }

          toilet_g = toilet_g + Number(item.TOILETG);          
          toilet_b = toilet_b + Number(item.TOILETB);

          if (item.WATER == "YES") {
            water = water + 1
          }

          if (item.HAND_PUMP == "YES") {
            hand_pump = hand_pump + 1
          }

          if (item.WELL_PROT == "YES") {
            whell_port = whell_port + 1
          }

          if (item.TAP == "YES") {
            tap = tap + 1
          }

          if (item.PACK_WATER == "YES") {
            pack_water = pack_water + 1
          }

          if (item.HANDWASH == "YES") {
            hand_wash = hand_wash + 1
          }

          if (item.ELECT == "YES") {
            electricity = electricity + 1
          }

          if (item.PGROUND == "YES") {
            play_ground = play_ground + 1
          }
        });

        const fulfillment = `*${district}* school statics as follows :\n\nTotal no of school(s) : ${total}\nup to grade IV : ${class_4}\nup to grade V : ${class_5}\nup to grade VIII : ${class_8}\nup to grade X : ${class_10}\nup to grade XII : ${class_12}\n\nNo. of school Type\nCo-ed : ${coed}, Girls : ${girl}, Boys : ${boy}\n\nNo. of school have Toilet\nGirls : ${toilet_g},  Boys : ${toilet_b}\n\nNo. of school(s) have\nWater : ${water}\nHand pump : ${hand_pump}\nWhell port : ${whell_port}\nTap water : ${tap}\nPacket water : ${pack_water}\nHand wash : ${hand_wash}\nElectricity : ${electricity}\nPlay ground : ${play_ground}`;

        agent.add(fulfillment);
        agent.add(new Suggestion('School Info.'));
        agent.add(new Suggestion('District Statics'));
        agent.add(new Suggestion('Quit'));

      }
    } else {
      const fulfillment = `Invalid District!😭\nPlease enter correct District name :`;
      agent.add(fulfillment);

    }
  } catch (e) {
    console.log(e);
  };
};
// Statical data
// End


// // Start
// // Suggesition
// const handelSuggestionMenu = async (agent) => {
//   try {
//     const fulfillment = `Thank you for your interest!🙏\n\nPlease provide your personal details with suggestion, starts with your name.`;
//     agent.add(fulfillment);
//   } catch (e) {
//     console.log(e);
//   };
// };

// const handelSuggestionDetails = async (agent) => {
//   try {
//     // const sessionId = agent.session.split("/").pop();
//     const person = agent.parameters["person-name"].name;
//     const phone = agent.parameters["phone-number"];
//     const suggestion = agent.parameters["suggestion"];
    
//     if ((person === "") && (phone === "") && (suggestion === "")) return;      
    
//     // chatDictionary[sessionId].person = person;
//     // chatDictionary[sessionId].phone = phone;
//     // chatDictionary[sessionId].suggestion = suggestion;

//     // insert to sheet
//     const response = await addSuggestion({Person: person,
//                                         Phone: phone,
//                                         Suggestion: suggestion});
    
//     if (!response) return;             

//     const fulfillment = `Thank you *${person}*! 👍
//     \nOur team will contact (Phone. ${phone}) you soon.
//     \n\nAny thing else?`;

//     agent.add(fulfillment);
//   } catch (e) {
//     console.log(e);
//   };
// };
// // Suggesition
// // End


// Start
// Quit
const handelSchoolQuit = async (agent) => {
  // const sessionId = agent.session.split("/").pop();

  // delete chatDictionary[sessionId];
  agent.end("Ok, Bye for now! 👋👋👋");
}
// Quit
// End


module.exports = {
  // handelSchoolDemo,
  handelSchoolWelcome,
  handelIndividualSchoolMenu,
  handelIndividualSchool,
  handelDistrictStaticsMenu,
  handelDistrictStatics,
  // handelSuggestionMenu,
  // handelSuggestionDetails,
  handelSchoolQuit
};