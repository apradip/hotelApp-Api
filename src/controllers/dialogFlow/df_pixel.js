const { Suggestion, Image, Card } = require("dialogflow-fulfillment");
const { getProduct, addSupport, addEnquiry } = require("./google_sheet_helper");

class chatType {
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
  // const CONTEXT_NAME = "test";
  // const sessionId = agent.session.split("/").pop();
  //agent.context.get(CONTEXT_NAME) ? person = agent.context.get(CONTEXT_NAME).parameters["person"].name : person = "";

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
      buttonUrl: 'https://hoteldolphin.in/digha.php'
    }));

    // end context
    agent.end("ok bye");
  } catch (e) {
    console.log(e)
  };
};

// Start
// Initial menu
const handelWelcome = async (agent) => {
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
  let category = [];

  try {
    const res = await getProduct({ "Category": "", "SubCategory" : "", "OS": "" });

    if (res) {
      const fulfillment = `We have quite a range of products (i.e., *Servers*, *Email*, *ChatBot*).\n\nWhich product are you looking for?`;
      agent.add(fulfillment);
      
      res.map((item) => {
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
  let subcategory = [];

  try {
    const res = await getProduct({ "Category": "Server", "SubCategory" : "", "OS": "" });

    if (res) {
      const fulfillment = `We have multiple types of servers (i.e., *Dedicated*, *VPS*, *Shared*).\n\nWhat type of server you are looking for?`;
      agent.add(fulfillment);
      
      res.map((item) => {
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
  let osArr = [];

  try {
    const res = await getProduct({ "Category": "Server", "SubCategory" : "Dedicated", "OS": "" });

    if (res) {
      const fulfillment = `We have dedicated server with multiple OS (i.e., *Windows*, *Linux*).\n\nWhat OS you are looking for?`;
      agent.add(fulfillment);
      
      res.map((item) => {
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
    const res = await getProduct({ "Category": "Server", "SubCategory" : "Dedicated", "OS": "Windows" });

    if (res) {
      let fulfillment = `We have multiple types of dedicated windows server as follows :`;
      let idx = 0;

      res.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      agent.add(fulfillment);
      
      res.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};

const handelDedicatedLinux = async (agent) => {
  try {
    const res = await getProduct({ "Category": "Server", "SubCategory" : "Dedicated", "OS": "Linux" });

    if (res) {
      let fulfillment = `We have multiple types of dedicated linux server as follows :`;
      let idx = 0;

      res.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      agent.add(fulfillment);
      
      res.map((item) => {
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
  let osArr = [];

  try {
    const res = await getProduct({ "Category": "Server", "SubCategory" : "VPS", "OS": "" });

    if (res) {
      const fulfillment = `We have vps with various OS (i.e., *Windows*, *Linux*).\n\nWhich OS you are looking for?`;
      agent.add(fulfillment);
      
      res.map((item) => {
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
  let idx = 0;

  try {
    const res = await getProduct({ "Category": "Server", "SubCategory" : "VPS", "OS": "Windows" });

    if (res) {
      let fulfillment = `We have various types of virtual private windows server as follows :`;

      res.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      agent.add(fulfillment);
      
      res.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }
  } catch (e) {
    console.log(e);
  };
};

const handelVPSLinux = async (agent) => {
  let idx = 0;

  try {
    const res = await getProduct({ "Category": "Server", "SubCategory" : "VPS", "OS": "Linux" });

    if (res) {
      let fulfillment = `We have multiple types of virtual private linux server as follows :`;

      res.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      agent.add(fulfillment);
      
      res.map((item) => {
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
  let idx = 0;

  try {
    const res = await getProduct({ "Category": "Server", "SubCategory" : "Shared", "OS": "" });

    if (res) {
      let fulfillment = `We have various kind of shared servers as follows :`;

      res.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      agent.add(fulfillment);
      
      res.map((item) => {
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
    const res = await getProduct({ "Category": "Email", "SubCategory" : "", "OS": "" });

    if (res) {
      let fulfillment = `We have wide range of email servers as follows :`;
      let idx = 0;

      res.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      agent.add(fulfillment);
      
      res.map((item) => {
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
    const res = await getProduct({ "Category": "ChatBot", "SubCategory" : "", "OS": "" });

    if (res) {
      let fulfillment = `We have  chatbots as follows :`;
      let idx = 0;

      res.map((item) => {
        idx = idx + 1;
        fulfillment = fulfillment + `\n\n${idx}. *${item.Name}* :\n${item.Description}`
      });

      agent.add(fulfillment);
      
      res.map((item) => {
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
  try {
    const sessionId = agent.session.split("/").pop();
    const product = agent.parameters["product"];
    if (product === "") return;      

    chatDictionary[sessionId].products.push(product); 
    const fulfillment = `Thank you!👌\nFor your interest on our product (*${product}*).\n\nPlease provide your details for further communication starts with your comany.`;
    agent.add(fulfillment);
  } catch (e) {
    console.log(e);
  };
};

const handelEnquiryDetails = async (agent) => {
  try {
    const sessionId = agent.session.split("/").pop();
    const company = agent.parameters["company-name"];
    const person = agent.parameters["person-name"].name;
    const phone = agent.parameters["phone-number"];
    const product = agent.parameters["product"];

    if ((company === "") && (person === "") && (phone === "") && (product === "")) return;      

    chatDictionary[sessionId].company = company;
    chatDictionary[sessionId].person = person;
    chatDictionary[sessionId].phone = phone;
    
    // insert to sheet
    const response = await addEnquiry({Company: company.toUpperCase(),
                                  Person: person.toUpperCase(),
                                  Phone: phone,
                                  Product: product});

    if (!response) return;                                  
   
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
    const fulfillment = `Sorry,🙏for your inconvenient!\n\nPlease provide your details for further communication starts with your comany.`;
    agent.add(fulfillment);
  } catch (e) {
    console.log(e);
  };
};

const handelSupportDetails = async (agent) => {
  try {
    const sessionId = agent.session.split("/").pop();
    const company = agent.parameters["company-name"];
    const person = agent.parameters["person-name"].name;
    const phone = agent.parameters["phone-number"];
    const note = agent.parameters["issue-note"];

    if ((company === "") && (person === "") && (phone === "") && (note === "")) return;      
    
    chatDictionary[sessionId].company = company;
    chatDictionary[sessionId].person = person;
    chatDictionary[sessionId].phone = phone;
    chatDictionary[sessionId].note = note;

    // insert to sheet
    const response = await addSupport({Company: company,
                                        Person: person,
                                        Phone: phone,
                                        Note: note});
    
    if (!response) return;             

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

  delete chatDictionary[sessionId];
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