const { google } = require("googleapis");

const keyFile = "./src/config/googleKey.json";
const scopes = "https://www.googleapis.com/auth/spreadsheets";
const valueInputOption = "RAW";

const productSheetId = "11HKAortDvJgBHaOeTbVTX5fmwLUZqRCgPCrFYnZXipg";
const productRange = "product";

const supportSheetId = "1eC86MQguy268Alm20IxK2mkO8zc26n3GEdmsUlpekqk";
const supportRange = "support";

const enquirySheetId = "1Z37U3sG1iS7TWO_GLZplp6wwR8UzCd0BjL-pCcnxuJY";
const enquiryRange = "enquiry";

const formatDate = async (data) => {
  let formatedData = [];

  try {
    const rows = data;

    if (rows.length) {
        var rowHead = rows.shift();
        formatedData = rows.map((row) => {
            return rowHead.reduce((obj, key, i) => {
              obj[key] = row[i] ? row[i] : "";
              return obj;
            }, {});
        });
    }    
  } catch (e) {
    console.error(e);
  }

  return formatedData;
}

const authentication = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFile,
      scopes: scopes 
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    return sheets;
  } catch (e) {
    console.error(e);
  }

  return;
}

async function getProduct(searchJson = {}) {
  let data = null;
  let condition = "";

  try {
    const sheets = await authentication();
    const readData = await sheets.spreadsheets.values.get({
      spreadsheetId: productSheetId,
      range: productRange
    });

    data = await formatDate(readData.data.values);  

    for(var key in searchJson) {
      if (searchJson[key].length > 0) {
        switch(key) {
          case "Category":
            condition = d => d.Category === searchJson[key];
            data = data.filter(condition);
  
            break;
          case "SubCategory":
            condition = d => d.SubCategory === searchJson[key];
            data = data.filter(condition);

            break;
          case "OS":
            condition = d => d.OS === searchJson[key];
            data = data.filter(condition);
    
            break;
          default:
            break;
        }
      }
      // const search = d => d.Category === searchJson[key];
      // data = data.filter(search);
    }
  } catch (e) {
    console.error(e);
  }

  return data;
};

async function addProduct(valueJson) {
  try {
    const values = [
      [
        valueJson.Category, 
        valueJson.SubCategory, 
        valueJson.OS, 
        valueJson.Name, 
        valueJson.Description, 
        valueJson.Price, 
        valueJson.Unit, valueJson.Keyword
      ]
    ];

    const resource = {
      values
    };

    const sheets = await authentication();

    const status = await sheets.spreadsheets.values.append({ 
      spreadsheetId : productSheetId, 
      range : productRange, 
      valueInputOption: valueInputOption, 
      resource : resource
    }).then(response => response.statusText);

    if (status === "OK") { return true; }
  } catch (e) {
    console.error(e);
  }

  return false;
};

async function addSupport(valueJson) {
  try {
    const values = [
      [
        valueJson.Company, 
        valueJson.Person, 
        valueJson.Phone, 
        valueJson.Note
      ]
    ];

    const resource = {
      values
    };

    const sheets = await authentication();

    const status = await sheets.spreadsheets.values.append({ 
      spreadsheetId : supportSheetId, 
      range : supportRange, 
      valueInputOption: valueInputOption, 
      resource : resource
    }).then(response => response);

    if (status.statusText === "OK") { return true; }
  } catch (e) {
    console.error(e);
  }

  return false;
};

async function addEnquiry(valueJson) {
  try {
    const values = [
      [
        valueJson.Company, 
        valueJson.Person, 
        valueJson.Phone, 
        valueJson.Product
      ]
    ];

    const resource = {
      values
    };

    const sheets = await authentication();

    const status = await sheets.spreadsheets.values.append({ 
      spreadsheetId : enquirySheetId, 
      range : enquiryRange, 
      valueInputOption: valueInputOption, 
      resource : resource
    }).then(response => response.statusText);

    if (status === "OK") { return true; }
  } catch (e) {
    console.error(e);
  }

  return false;
};

module.exports = { getProduct, addProduct, addSupport, addEnquiry };  