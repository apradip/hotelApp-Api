const { Suggestion } = require('dialogflow-fulfillment');
const { getSchoolDetail, getStaticsDetail } = require('./google_sheet_school_helper');


// Start
// Initial menu
const SchoolWelcomeHandler = async (agent) => {
  try {
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
const SchoolIndividualMenuHandler = async (agent) => {
  try {
      const fulfillment = `Please enter the UDISE Code :`;

      agent.add(fulfillment);
  } catch (e) {
    console.log(e);
  };
};

const SchoolIndividualDataHandler = async (agent) => {
  try {
    const udise = agent.parameters["udiseCode"];
    const res = await getSchoolDetail(udise);

    console.log(res);
    // const res = await getSchoolDetail({ "SCHCD" : udise });

    // if (res) {
    //   if (res.length === 0) {
    //     const fulfillment = `Invalid UDISE Code!😭\nPlease enter a correct UDISE Code :`;
    //     agent.add(fulfillment);

    //   } else {
    //     let fulfillment = `*Great !* 👍\n\nSchool detail as follows :`;

    //     res.map((item) => {
    //       fulfillment = fulfillment + `\n\n*${item.SCHOOL_NAME}*\n${item.DISTRICT_NAME}\n${item.BLOCK_NAME}\n${item.VILLAGE_WARD_NAME}\n\nType : ${item.SCHTYPE}\n\nNo. of toilet(s) :\nBoys : ${item.TOILETB}, Girls : ${item.TOILETG}\n\nStatus of following facility :\nWater : ${item.WATER}\nHand pump : ${item.HAND_PUMP}\nWell port : ${item.WELL_PROT}\nTap water : ${item.TAP}\nPacket Water : ${item.PACK_WATER_FUN}\nHand wash : ${item.HANDWASH}\nElectricity : ${item.ELECT}\nPlayground : ${item.PGROUND}`
    //     });

    //     agent.add(fulfillment);
    //     agent.add(new Suggestion('School Info.'));
    //     agent.add(new Suggestion('District Statics'));
    //     agent.add(new Suggestion('Quit'));

    //   }
    //  } else {
    //   const fulfillment = `Invalid UDISE Code!😭\nPlease enter a correct UDISE Code :`;

    //   agent.add(fulfillment);
    // }
  } catch (e) {
    console.log(e);
  };
};
// Individual School
// End


// Start
// Statical data
const SchoolDistrictStaticsMenuHandler = async (agent) => {
  try {
      const fulfillment = `Please enter District name :`;
      agent.add(fulfillment);
  } catch (e) {
    console.log(e);
  };
};

const SchoolDistrictStaticsHandler = async (agent) => {
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

          if (item.CLASS_TO === '4') {
            class_4 = class_4 + 1;
          }
          else if (item.CLASS_TO === '5') {
            class_5 = class_5 + 1;          
          }
          else if (item.CLASS_TO === '8') {
            class_8 = class_8 + 1;          
          }
          else if (item.CLASS_TO === '10') {
            class_10 = class_10 + 1;          
          }
          else if (item.CLASS_TO === '12') {
            class_12 = class_12 + 1;          
          }

          if (item.SCHTYPE === 'CO-ED') {
            coed = coed + 1;
          }
          else if (item.SCHTYPE === 'GIRLS') {
            girl = girl + 1;          
          }
          else if (item.SCHTYPE === 'BOYS') {
            boy = boy + 1;          
          }

          toilet_g = toilet_g + Number(item.TOILETG);          
          toilet_b = toilet_b + Number(item.TOILETB);

          if (item.WATER === 'YES') {
            water = water + 1
          }

          if (item.HAND_PUMP === 'YES') {
            hand_pump = hand_pump + 1
          }

          if (item.WELL_PROT === 'YES') {
            whell_port = whell_port + 1
          }

          if (item.TAP === 'YES') {
            tap = tap + 1
          }

          if (item.PACK_WATER === 'YES') {
            pack_water = pack_water + 1
          }

          if (item.HANDWASH === 'YES') {
            hand_wash = hand_wash + 1
          }

          if (item.ELECT === 'YES') {
            electricity = electricity + 1
          }

          if (item.PGROUND === 'YES') {
            play_ground = play_ground + 1
          }
        });

        const fulfillment = `School statics for *${district}* as follows :\n\nTotal no of school(s) : ${total}\n\nNo. of school(s) :\nGrade up to IV : ${class_4}\nGrade up to V : ${class_5}\nGrade up to VIII : ${class_8}\nGrade up to X : ${class_10}\nGrade up to XII : ${class_12}\n\nNo. of school Type :\nCo-ed : ${coed}, Girls : ${girl}, Boys : ${boy}\n\nNo. of school have Toilet :\nGirls : ${toilet_g}, Boys : ${toilet_b}\n\nNo. of school(s) have following facility :\nWater : ${water}\nHand pump : ${hand_pump}\nWhell port : ${whell_port}\nTap water : ${tap}\nPacket water : ${pack_water}\nHand wash : ${hand_wash}\nElectricity : ${electricity}\nPlay ground : ${play_ground}`;

        agent.add(fulfillment);
        agent.add(new Suggestion(`School Info.`));
        agent.add(new Suggestion(`District Statics`));
        agent.add(new Suggestion(`Quit`));

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


// Start
// Quit
const SchoolQuitHandler = async (agent) => {
  const fulfillment = `Ok, Bye for now! 👋👋👋`;

  agent.end(fulfillment);
}
// Quit
// End


module.exports = {
  SchoolWelcomeHandler,
  SchoolIndividualMenuHandler,
  SchoolIndividualDataHandler,
  SchoolDistrictStaticsMenuHandler,
  SchoolDistrictStaticsHandler,
  SchoolQuitHandler
};