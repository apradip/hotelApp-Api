const axios = require("axios");
const { Card, Suggestion, Image } = require("dialogflow-fulfillment");

const PRODUCT_SHEETDB_API_URL = "https://sheetdb.io/api/v1/edmax89c5rfmp";
const ENQUIRY_SHEETDB_API_URL = "https://sheetdb.io/api/v1/dtc7phqv4mbfi";

class chat {
  constructor(company = "", person = "", phone = "", note = "", products = []) {
    this.company = company,  
    this.person = person,
    this.phone = phone,
    this.note = note,
    this.products = products
  };
};

let chatDictionary = {};


const handelTest = async (agent) => {
  console.log("handelTest");
  const CONTEXT_NAME = "test";
  let person = "";

  const sessionId = agent.session.split("/").pop();
  
  agent.context.get(CONTEXT_NAME) ? person = agent.context.get(CONTEXT_NAME).parameters["person"].name : person = "";
  person !== "" ? agent.add(`Thank's ${person}! Do you want any thing else?`) : null;

  // const paraCpmpany = "Pixel";
  // const paraPerson = "Pradip";
  // const paraPhone = "9830152752";
  // const paraNote = "Server error";
  // const paraProduct = "Win Light (D)";
  
  // try {
    // let currentChat = chatDictionary[sessionId];

    // if (!currentChat) {
    //   let productArr = [];
      
    //   if (paraProduct !== "") {
    //     productArr.splice(0, 0, paraProduct);
    //   }

    //   chatDictionary[sessionId] = new chat( 
    //                                         paraCpmpany !== "" ? paraCpmpany : "", 
    //                                         paraPerson !== "" ? paraPerson : "", 
    //                                         paraPhone !== "" ? paraPhone : "", 
    //                                         paraNote !== "" ? paraNote : "", 
    //                                         productArr);
    // } else {
    //   chatDictionary[sessionId].chat.company = "Coral";
    // }

    // console.log(chatDictionary);
    // console.log(chatDictionary[sessionId].products);

    // chatDictionary[sessionId].products.forEach((product) => {
    //   console.log(product);
    // })

    // chatList.map((item) => {
    //   if (item.sessionId === sessionId) {
    //     if (((item.company === "") || (item.person === "") || (item.phone === "")) && ((paraCpmpany !== "") || (paraPerson !== "") || (paraPhone !== ""))) {
    //       item.company = paraCpmpany;
    //       item.person = paraPerson;
    //       item.phone = paraPhone;

    //       chatList[idx].company = item.company;
    //       chatList[idx].person = item.person ;
    //       chatList[idx].phone = item.phone;
    //     }

    //     if ((item.note === "") && (paraNote !== "")) {
    //       item.note = paraNote;
          
    //       chatList[idx].note = item.note;
    //     }

    //     if (item.products.length === 0) {
    //       if (paraProduct !== "") {
    //         item.products.push(paraProduct);

    //         chatList[idx].products = item.products;
    //       }
    //     } else {
    //       if (paraProduct !== "") {
    //         let isProductFound = false;

    //         item.products.map((product) => {
    //           if (product === paraProduct) {
    //             isProductFound = true;
    //           }
    //         });

    //         if (!isProductFound) {
    //           item.products.push(paraProduct);

    //           chatList[idx].products = item.products;
    //         }
    //       }
    //     }

    //     currentChat = item;
    //     isSessionFound = true;
    //   }

    //   idx++;
    // });

    // if (!isSessionFound) {
    //   let productArr = [];
    //   currentChat = new chatType(sessionId, 
    //                               paraCpmpany !== "" ? paraCpmpany : "", 
    //                               paraPerson !== "" ? paraPerson : "", 
    //                               paraPhone !== "" ? paraPhone : "", 
    //                               paraNote !== "" ? paraNote : "", 
    //                               paraProduct !== "" ? productArr.push(paraProduct) : productArr);

    //   chatList.push(currentChat);
    // }

    // console.log(chatList);
    // console.log(currentChat);
    // console.log(currentChat.products[0]);

    //add text
    // agent.add("What is your name ?");
    
    //add suggestion clip
    // agent.add(new Suggestion("Products"));
    // agent.add(new Suggestion("Accounts"));
    // agent.add(new Suggestion("Customer Service"));

    // agent.add(new Suggestion({
    //   title: 'Visit our website',
    //   url: 'https://forms.gle/ubCWmJqwet29M5jS6',
    // }));

    // agent.add(new Image({
    //   imageUrl: 'https://s3.ap-south-1.amazonaws.com/emaillive.in/images/Ganeshchaturti.jpg',
    //   accessibilityText: 'This is the description of the image',
    // }));

    // agent.add(new Card({
    //   title: `Title: this is a card title`,
    //   text: `This is the body text of a card. You can even use line breaks and emoji! \uD83D\uDC81`,
    //   buttonText: 'Click me',
    //   buttonUrl: 'https://forms.gle/ubCWmJqwet29M5jS6'
    // }));

  // } catch (e) {
  //   console.log(e)
  // };
};

// Start
// Initial menu
const handelWelcome = async (agent) => {
  try {
    // const sessionId = agent.session.split("/").pop();
    const fulfillment = `Welcome to Pixel Informatics! 👨‍💼\nI'm happy to help you with anything you need today. It's a pleasure to chat with you today. \n\nWhat do you like to know (Product or Support)?`;

    agent.add(fulfillment);
    agent.add(new Suggestion("Products"));
    agent.add(new Suggestion("Support"));
  } catch (e) {
    console.log(e);
  };
};
// Initial menu
// End

// Start
// Product menu
const handelProductMenu = async (agent) => {
  try {
    // const sessionId = agent.session.split("/").pop();
    let category = [];
    const res = await axios.get(PRODUCT_SHEETDB_API_URL);

    if (res.data) {
      const fulfillment = `We have quite a range of products (i.e., *Web Servers*, *Email Servers*, *ChatBot Utilities*).\n\nWhich product are you looking for?`;
      agent.add(fulfillment);
      
      res.data.map((item) => {
        category.push(item.Category)
      });

      const distinct = [...new Set(category)];
      distinct.map((item) => {
        agent.add(new Suggestion(`${item}`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};
// Product menu
// End

// Start
// Server Menu
const handelServerCategoryMenu = async (agent) => {
  try {
    const sessionId = agent.session.split("/").pop();
    let subcategory = [];
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server");

    if (res.data) {
      const fulfillment = `We have multiple types of servers (i.e., *Dedicated*, *VPS*, *Shared*).\n\nWhat type of server you are looking for?`;
      agent.add(fulfillment);
      
      res.data.map((item) => {
        subcategory.push(item.SubCategory)
      });

      const distinct = [...new Set(subcategory)];
      distinct.map((item) => {
        agent.add(new Suggestion(`${item} Server`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};


// Start
// Dedicated Server
const handelDedicatedServerOSMenu = async (agent) => {
  try {
    const sessionId = agent.session.split("/").pop();
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=Dedicated");
    let osArr = [];

    if (res.data) {
      const fulfillment = `We have dedicated server with multiple OS (i.e., *Windows*, *Linux*).\n\nWhat OS you are looking for?`;
      agent.add(fulfillment);
      
      res.data.map((item) => {
        osArr.push(item.OS)
      });

      const distinct = [...new Set(osArr)];
      distinct.map((item) => {
        agent.add(new Suggestion(`Dedicated (${item})`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};

const handelDedicatedWindows = async (agent) => {
  try {
    const sessionId = agent.session.split("/").pop();
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=Dedicated&OS=Windows");

    if (res.data) {
      let fulfillment = `We have multiple types of dedicated windows server as follows :`;
      let idx = 0;

      res.data.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      agent.add(fulfillment);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};

const handelDedicatedLinux = async (agent) => {
  try {
    const sessionId = agent.session.split("/").pop();
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=Dedicated&OS=Linux");

    if (res.data) {
      let fulfillment = `We have multiple types of dedicated linux server as follows :`;
      let idx = 0;

      res.data.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      agent.add(fulfillment);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};
// Dedicated Server
// End


// Start
// VPS
const handelVPSOSMenu = async (agent) => {
  try {
    const sessionId = agent.session.split("/").pop();
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=VPS");
    let osArr = [];

    if (res.data) {
      const fulfillment = `We have vps with various OS (i.e., *Windows*, *Linux*).\n\nWhich OS you are looking for?`;
      agent.add(fulfillment);
      
      res.data.map((item) => {
        osArr.push(item.OS)
      });

      const distinct = [...new Set(osArr)];
      distinct.map((item) => {
        agent.add(new Suggestion(`VPS (${item})`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};

const handelVPSWindows = async (agent) => {
  try {
    const sessionId = agent.session.split("/").pop();
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=VPS&OS=Windows");

    if (res.data) {
      let fulfillment = `We have various types of virtual private windows server as follows :`;
      let idx = 0;

      res.data.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      agent.add(fulfillment);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};

const handelVPSLinux = async (agent) => {
  try {
    const sessionId = agent.session.split("/").pop();
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=VPS&OS=Linux");

    if (res.data) {
      let fulfillment = `We have multiple types of virtual private linux server as follows :`;
      let idx = 0;

      res.data.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      agent.add(fulfillment);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};
// VPS
// End


// Start
// Shared Server
const handelSharedServer = async (agent) => {
  try {
    const sessionId = agent.session.split("/").pop();
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=Shared");

    if (res.data) {
      let fulfillment = `We have various kind of shared servers as follows :`;
      let idx = 0;

      res.data.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      agent.add(fulfillment);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};
// Shared Server
// End


// Server Menu
// End


// Start
// Email
const handelEmail = async (agent) => {
  try {
    const sessionId = agent.session.split("/").pop();
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Email");

    if (res.data) {
      let fulfillment = `We have wide range of email servers as follows :`;
      let idx = 0;

      res.data.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      agent.add(fulfillment);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};
// Email
// End


// Start
// ChatBot
const handelChatBot = async (agent) => {
  try {
    const sessionId = agent.session.split("/").pop();
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=ChatBot");

    if (res.data) {
      let fulfillment = `We have  chatbots as follows :`;
      let idx = 0;

      res.data.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}`
      });

      agent.add(fulfillment);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};
// ChatBot
// End


// Start
// Enquiry
const handelEnquiry = async (agent) => {
  const CONTEXT_NAME = "enquiry";
  //const sessionId = agent.session.split("/").pop();

  let product = "";

  try {
    agent.context.get(CONTEXT_NAME) ? context = agent.context.get(CONTEXT_NAME) : context = null;
    if (!context) return;

    product = context.parameters["product"] ? context.parameters["product"].toUpperCase() : ""; 
    if (product === "") return;      

    const fulfillment = `Thank you!👌\nFor your interest on our product (*${product}*).\n\nPlease provide your details for further communication starts with your comany.`;
    agent.add(fulfillment);
  } catch (e) {
    console.log(e);
  };
};

const handelEnquiryDetails = async (agent) => {
  const CONTEXT_NAME = "enquiry";

  // const sessionId = agent.session.split("/").pop();
  let context = null;
  let company = "";
  let person = "";
  let phone = "";
  let product = "";

  //find the session id, if not add this, else ignore
  //find contact details within the session id, if not add this, else ignore

  try {
    agent.context.get(CONTEXT_NAME) ? context = agent.context.get(CONTEXT_NAME) : context = null;

    if (!context) return;

    company = context.parameters["company-name"] ? context.parameters["company-name"].toUpperCase() : ""; 
    person = context.parameters["person-name"].name ? context.parameters["person-name"].name.toUpperCase() : "";
    phone = context.parameters["phone-number"] ? context.parameters["phone-number"] : "";
    product = context.parameters["product"] ? context.parameters["product"] : "";

    if ((company === "") && (person === "") && (phone === "") && (product === "")) return;      

    // insert to sheet
    const res = await axios.post(ENQUIRY_SHEETDB_API_URL, 
                              {Company: company.toUpperCase(),
                                Person: person.toUpperCase(),
                                Phone: phone,
                                Note: product});
      
    if (res.data.created <= 0) return;
    
    const fulfillment = `Thank you *${person.toUpperCase()}* for your interest on our product (*${product}*)! 👍\nOur team will contact (phone. *${phone}*) you soon.\n\nAny thing else?`;
    agent.add(fulfillment);
  } catch (e) {
    console.log(e);
  };
};
// Enquiry
// End


// Start
// Customer Support
const handelSupport = async (agent) => {
  try {
    // const sessionId = agent.session.split("/").pop();
    // console.log(agent.context);
    //find the session id, if not add this
    //find note within the session id, if not add this, else ignote

    const fulfillment = `Sorry,🙏for your inconvenient!\n\nPlease enter your details including issues.`;
    agent.add(fulfillment);
  } catch (e) {
    console.log(e);
  };
};

const handelSupportDetails = async (agent) => {
  const CONTEXT_NAME = "support";
  // const sessionId = agent.session.split("/").pop();

  let context = null;
  let company = "";
  let person = "";
  let phone = "";
  let note = "";
  
  //find the session id, if not add this, else ignore
  //find contact details within the session id, if not add this, else ignore

  try {
    agent.context.get(CONTEXT_NAME) ? context = agent.context.get(CONTEXT_NAME) : context = null;
    if (!context) return;

    company = context.parameters["company-name"] ? context.parameters["company-name"].toUpperCase() : ""; 
    person = context.parameters["person-name"].name ? context.parameters["person-name"].name.toUpperCase() : "";
    phone = context.parameters["phone-number"] ? context.parameters["phone-number"] : "";
    note = context.parameters["issue-note"] ? context.parameters["issue-note"] : "";

    if ((company === "") && (person === "") && (phone === "") && (note === "")) return;      

    // insert to sheet
    const res = await axios.post(ENQUIRY_SHEETDB_API_URL, 
                              {Company: company,
                                Person: person,
                                Phone: phone,
                                Note: note});
      
    if (res.data.created <= 0) return;

    const fulfillment = `Thank you *${person}*! 👍\nOur support team will contact (Phone. ${phone}) you soon.\n\nAny thing else?`;
    agent.add(fulfillment);
  } catch (e) {
    console.log(e);
  };
};
// Customer Support
// End


const handelQuit = async (agent) => {
  const sessionId = agent.session.split("/").pop();


  //put all the details to db
  //find the session id, if found remove this, else ignore

  agent.end("Ok, Buy for now!");
}

module.exports = {
  handelTest,
  handelWelcome,
  handelProductMenu,
  handelServerCategoryMenu,
  handelDedicatedServerOSMenu,
  handelDedicatedWindows,
  handelDedicatedLinux,
  handelVPSOSMenu,
  handelVPSWindows,
  handelVPSLinux,
  handelSharedServer,
  handelEmail,
  handelChatBot,
  handelEnquiry,
  handelEnquiryDetails,
  handelSupport,
  handelSupportDetails,
  handelQuit
};