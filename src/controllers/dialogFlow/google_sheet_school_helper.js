// const { google } = require("googleapis");

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const keyFile = "./src/config/googleKey.json";
const scopes = "https://www.googleapis.com/auth/spreadsheets";
const valueInputOption = "RAW";

const email = 'schoollive-dort@appspot.gserviceaccount.com';
const key = '4bc36a21b18e960ad0ad411a854a04abe57bdfcf';

const schoolSheetId = "17zwgI20nvqkwCV1-kTrVcCdJ9trFodwbgrA8iH64v9E";
const schoolRange = "school";

const suggestionSheetId = "1xqmlS-0o-fZEgISDhx09fNOFWHiaS9IK3vSRkcLjZSA";
const suggestionRange = "suggestion";


const authentication = async () => {
  try {
    // const auth = new google.auth.GoogleAuth({
    //   keyFile: keyFile,
    //   scopes: scopes 
    // });
    // const client = await auth.getClient();
    // const sheets = google.sheets({ version: "v4", auth: client });

    // return sheets;


    const serviceAccountAuth = new JWT({
      email: email,
      key: key,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });
    
    const doc = new GoogleSpreadsheet(schoolSheetId, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; 
    const rows = await sheet.getRows();

    return rows;
  } catch (e) {
    console.error(e);
  }

  return;
}

const formatData = async (data) => {
  let formatedData = [];

  try {
    const rows = data;

    if (rows.length) {
        var rowHead = rows.shift();
        formatedData = rows.map((row) => {
            return rowHead.reduce((obj, key, i) => {
              obj[key] = row[i] ? row[i].toUpperCase() : "";
              return obj;
            }, {});
        });
    }    
  } catch (e) {
    console.error(e);
  }

  return formatedData;
}


async function getSchoolDetail(udise) {
  let data = null;
  let condition = "";

  try {
    // const sheet = await authentication();
    // const rows = await sheet.getRows();
    const rows = await authentication();

    console.log(rows);
  //   const sheets = await authentication();
  //   const readData = await sheets.spreadsheets.values.get({
  //     spreadsheetId: schoolSheetId,
  //     range: schoolRange
  //   });

  //   data = await formatData(readData.data.values);  

  //   for(var key in searchJson) {
  //     searchJson[key] = searchJson[key] + "";

  //     if (searchJson[key].length > 0) {
  //       switch(key) {
  //         case "SCHCD":
  //           condition = d => d.SCHCD === searchJson[key];
  //           data = data.filter(condition);
  
  //           break;

  //         default:
  //           break;
  //       }
  //     }
  //   }

    // const rows = await sheet.getRows();
    // console.log(rows);
  } catch (e) {
    console.error(e);
  }

  // return data;
  return null;
};

async function getStaticsDetail(searchJson = {}) {
  let data = null;
  let condition = "";

  try {
    const sheets = await authentication();
    const readData = await sheets.spreadsheets.values.get({
      spreadsheetId: schoolSheetId,
      range: schoolRange
    });

    data = await formatData(readData.data.values);  

    for(var key in searchJson) {
      if (searchJson[key].length > 0) {
        switch(key) {
          case "DISTRICT_NAME":
            condition = d => d.DISTRICT_NAME === searchJson[key];
            data = data.filter(condition);
  
            break;

          default:
            break;
        }
      }
    }


  } catch (e) {
    console.error(e);
  }

  return data;
};

async function addSuggestion(valueJson) {
  try {
    const values = [
      [
        valueJson.Person.toUpperCase(), 
        valueJson.Phone, 
        valueJson.Suggestion
      ]
    ];

    const resource = {
      values
    };

    const sheets = await authentication();

    const status = await sheets.spreadsheets.values.append({ 
      spreadsheetId : suggestionSheetId, 
      range : suggestionRange, 
      valueInputOption: valueInputOption, 
      resource : resource
    }).then(response => response);

    if (status.statusText === "OK") { return true; }
  } catch (e) {
    console.error(e);
  }

  return false;
};


module.exports = { getSchoolDetail, getStaticsDetail, addSuggestion };  