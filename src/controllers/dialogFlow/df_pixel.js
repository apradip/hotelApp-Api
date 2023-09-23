const { Card, Suggestion, Image } = require("dialogflow-fulfillment");
const axios = require("axios");

const PRODUCT_SHEETDB_API_URL = "https://sheetdb.io/api/v1/edmax89c5rfmp";
const ENQUIRY_SHEETDB_API_URL = "https://sheetdb.io/api/v1/dtc7phqv4mbfi";

const handelTest = async (agent) => {
  console.log("handelTest");
  
  try {
    // plain text
    // agent.add("Sending response from Webhook server as v2.1.1");
    
    //add text
    agent.add("Please tell us what you want to know from me?");
    
    //add suggestion clip
    agent.add(new Suggestion("Products"));
    agent.add(new Suggestion("Accounts"));
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

  } catch (e) {
    console.log(e)
  };
  return;
};


const handelMenu = async (agent) => {
  try {
        agent.add(`Welcome to Pixel Informatics! 👨‍💼\nI'm happy to help you with anything you need today. It's a pleasure to chat with you today. \n\nWhat do you like to know about?`);

        agent.add(new Suggestion("Products"));
        agent.add(new Suggestion("Support"));
  } catch (e) {
    console.log(e);
  };
};



const handelProductMenu = async (agent) => {
  try {
    let category = [];
    const res = await axios.get(PRODUCT_SHEETDB_API_URL);

    if (res.data) {
      let output = `We have various kind of product (i.e., Server/Email/ChatBot).\n\nWhich product are you looking for?`;
      agent.add(output);
      
      res.data.map((item) => {
        category.push(item.Category)
      });

      const distinct = [...new Set(category)];
      distinct.map((item) => {
        agent.add(new Suggestion(`${item}`));
      });
    }

        // agent.add(`We have various kind of product (i.e., Server/Email/ChatBot).\n\nWhich product are you looking for?`);

        // agent.add(new Suggestion("Server"));
        // agent.add(new Suggestion("Email"));
        // agent.add(new Suggestion("ChatBot"));
  } catch (e) {
    console.log(e);
  };
};


// Start
// Server Menu
const handelServerCategoryMenu = async (agent) => {
  try {
    let subcategory = [];
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server");

    if (res.data) {
      let output = `We have multiple type of server (i.e., Dedicated/VPS/Share).\n\nWhich category are you looking for?`;
      agent.add(output);
      
      res.data.map((item) => {
        subcategory.push(item.SubCategory)
      });

      const distinct = [...new Set(subcategory)];
      distinct.map((item) => {
        agent.add(new Suggestion(`${item} Server`));
      });
    }

        // agent.add(`We have multiple type of server (i.e., Dedicated/VPS/Share).\n\nWhich category are you looking for?`);

        // agent.add(new Suggestion("Dedicated Server"));
        // agent.add(new Suggestion("Virtual Server"));
        // agent.add(new Suggestion("Shared Server"));
  } catch (e) {
    console.log(e);
  };
};


// Start
// Dedicated Server
const handelDedicatedServerOSMenu = async (agent) => {
  try {
    let os = [];
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=Dedicated");

    if (res.data) {
      let output = `We have dedicated server with various OS (i.e., Windows/Linux).\n\nWhich OS are you looking for?`;
      agent.add(output);
      
      res.data.map((item) => {
        os.push(item.OS)
      });

      const distinct = [...new Set(os)];
      distinct.map((item) => {
        agent.add(new Suggestion(`Dedicated (${item})`));
      });
    }

    
        // agent.add(`We have dedicated server with various OS (i.e., Windows/Linux).\n\nWhich OS are you looking for?`);

        // agent.add(new Suggestion("Dedicated Windows"));
        // agent.add(new Suggestion("Dedicated Linux"));
  } catch (e) {
    console.log(e);
  };
};

const handelDedicatedWindows = async (agent) => {
  try {
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=Dedicated&OS=Windows");

    if (res.data) {
      let output = `We have various kind of dedicated windows server as follows :`;
      let cnt = 0;

      res.data.map((item) => {
        cnt = cnt + 1;
        output = output + `\n\n${cnt}. ${item.Name}:\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      output = output + `\n\nPlease provide your contact details to serve your requirement.`;
      agent.add(output);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }

        // agent.add(`We have following kind of Dedicated Windows Server :\n\n1. Dedicated-Win-Light:\n1 Core CPU, 256 MB Memory, 50 GB SSD Storage with pre-loaded latest version of windows server.\nRs. 650/- pre month.\n\n2. Dedicated-Win-Professional:\n4 Core CPU, 8 GB Memory, 2 TB SSD Storage with pre-loaded latest version of windows server.\nRs. 2500/- per month.\n\n3. Dedicated-Win-Custom:\nAny other custom configuration of windows OS and any hardware configuration can be done as your requirement.\n\nPlease provide your contact details to serve your requirement.`);

        // agent.add(new Suggestion("Dedicated-Win-Light"));
        // agent.add(new Suggestion("Dedicated-Win-Professional"));
        // agent.add(new Suggestion("Dedicated-Win-Custom"));
  } catch (e) {
    console.log(e);
  };
};

const handelDedicatedLinux = async (agent) => {
  try {
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=Dedicated&OS=Linux");

    if (res.data) {
      let output = `We have various kind of dedicated linux server as follows :`;
      let cnt = 0;

      res.data.map((item) => {
        cnt = cnt + 1;
        output = output + `\n\n${cnt}. ${item.Name}:\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      output = output + `\n\nPlease provide your contact details to serve your requirement.`;
      agent.add(output);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }

        // agent.add(`We have following kind of Dedicated Linux Server :\n\n1. Lux-Light:\n1 Core CPU, 256 MB Memory, 50 GB SSD Storage with pre-loaded latest version of linux server.\nRs. 350/- pre month.\n\n2. Lux-Professional:\n2 Core CPU, 4 GB Memory, 2 TB SSD Storage with pre-loaded latest version of linux server.\nRs. 900/- per month.\n\n3. Lux-Custom:\nAny other custom configuration of linux OS and any hardware configuration can be done as your requirement.\n\nPlease provide your contact details to serve your requirement.`);

        // agent.add(new Suggestion("Dedicated-Lux-Light"));
        // agent.add(new Suggestion("Dedicated-Lux-Professional"));
        // agent.add(new Suggestion("Dedicated-Lux-Custom"));
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
    let os = [];
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=VPS");

    if (res.data) {
      let output = `We have vps with various OS (i.e., Windows/Linux).\n\nWhich OS are you looking for?`;
      agent.add(output);
      
      res.data.map((item) => {
        os.push(item.OS)
      });

      const distinct = [...new Set(os)];
      distinct.map((item) => {
        agent.add(new Suggestion(`VPS (${item})`));
      });
    }

        //agent.add(`We have VPS with various OS (i.e., Windows/Linux).\nWhich OS are you looking for?`);

        //agent.add(new Suggestion("VPS Windows"));
        //agent.add(new Suggestion("VPS Linux"));
  } catch (e) {
    console.log(e);
  };
};

const handelVPSWindows = async (agent) => {
  try {
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=VPS&OS=Windows");

    if (res.data) {
      let output = `We have various kind of virtual private windows server as follows :`;
      let cnt = 0;

      res.data.map((item) => {
        cnt = cnt + 1;
        output = output + `\n\n${cnt}. ${item.Name}:\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      output = output + `\n\nPlease provide your contact details to serve your requirement.`;
      agent.add(output);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }

        // agent.add(`We have following kind of virtual private windows server :\n\n1. VPS-Win-Light:\n1 Core CPU, 256 MB Memory, 50 GB SSD Storage with pre-loaded latest version of windows server.\nRs. 350/- pre month.\n\n2. VPS-Win-Professional:\n4 Core CPU, 8 GB Memory, 2 TB SSD Storage with pre-loaded latest version of windows server.\nRs. 1200/- per month.\n\n3. VPS-Win-Custom:\nAny other custom configuration of windows OS and any hardware configuration can be done as your requirement.\n\nPlease provide your contact details to serve your requirement.`);

        // agent.add(new Suggestion("VPS-Win-Light"));
        // agent.add(new Suggestion("VPS-Win-Professional"));
        // agent.add(new Suggestion("VPS-Win-Custom"));
  } catch (e) {
    console.log(e);
  };
};

const handelVPSLinux = async (agent) => {
  try {
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=VPS&OS=Linux");

    if (res.data) {
      let output = `We have various kind of virtual private linux server as follows :`;
      let cnt = 0;

      res.data.map((item) => {
        cnt = cnt + 1;
        output = output + `\n\n${cnt}. ${item.Name}:\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      output = output + `\n\nPlease provide your contact details to serve your requirement.`;
      agent.add(output);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }

        // agent.add(`We have following kind of virtual private linux server :\n\n1. VPS-Lux-Light:\n1 Core CPU, 256 MB Memory, 50 GB SSD Storage with pre-loaded latest version of linux server.\nRs. 150/- pre month.\n\n2. VPS-Lux-Professional:\n2 Core CPU, 4 GB Memory, 2 TB SSD Storage with pre-loaded latest version of linux server.\nRs. 500/- per month.\n\n3. VPS-Lux-Custom:\nAny other custom configuration of linux OS and any hardware configuration can be done as your requirement.\n\nPlease provide your contact details to serve your requirement.`);

        // agent.add(new Suggestion("VPS-Lux-Light"));
        // agent.add(new Suggestion("VPS-Lux-Professional"));
        // agent.add(new Suggestion("VPS-Lux-Custom"));
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
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Server&SubCategory=Shared");

    if (res.data) {
      let output = `We have various kind of shared servers as follows :`;
      let cnt = 0;

      res.data.map((item) => {
        cnt = cnt + 1;
        output = output + `\n\n${cnt}. ${item.Name}:\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      output = output + `\n\nPlease provide your contact details to serve your requirement.`;
      agent.add(output);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }
        // agent.add(`We have following kind of virtual private linux server :\n\n1. Shared-Windows:\n50 GB SSD Storage with pre-loaded Windows OS\nRs. 1200/- pre year.\n\n2. Shared-Linux:\n50 GB SSD Storage with pre-loaded Windows OS\nRs. 1000/- pre year.\n\nPlease provide your contact details to serve your requirement.`);

        // agent.add(new Suggestion("Shared Windows"));
        // agent.add(new Suggestion("Shared Linux"));
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
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=Email");

    if (res.data) {
      let output = `We have various kind of email as follows :`;
      let cnt = 0;

      res.data.map((item) => {
        cnt = cnt + 1;
        output = output + `\n\n${cnt}. ${item.Name}:\n${item.Description}\nRs. ${item.Price}/- ${item.Unit}`
      });

      output = output + `\n\nPlease provide your contact details to serve your requirement.`;
      agent.add(output);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }
        // agent.add(`We have following email :\n\n1. Corporate Email:\nThis is 99.99% uptime & 99.99% delivery within minute, it also has 5 GB storage\nRs. 275/- per email per month\n\n2. MSME Email:\nThis server is capable to send email for any corporate but it is less uptime and 1GB storage per account.\nRs. 70/- per email per month\n\n3. Bulk Email:\nThis server us capable of sending 10000 email at a time. Basically all marketing & campaign email can be send by this.\nRs. 0.20/- per email.\n\nPlease provide your contact details to serve your requirement.`);

        // agent.add(new Suggestion("Corporate Email"));
        // agent.add(new Suggestion("MSME Email"));
        // agent.add(new Suggestion("Bulk Email"));
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
    const res = await axios.get(PRODUCT_SHEETDB_API_URL + "/search?Category=ChatBot");

    if (res.data) {
      let output = `We have various kind of chatbot as follows :`;
      let cnt = 0;

      res.data.map((item) => {
        cnt = cnt + 1;
        output = output + `\n\n${cnt}. ${item.Name}:\n${item.Description}`
      });

      output = output + `\n\nPlease provide your contact details to serve your requirement.`;
      agent.add(output);
      
      res.data.map((item) => {
        agent.add(new Suggestion(`${item.Name}`));
      });
    }

        // agent.add(`ChatBot is a WhatsApp based customized product chat, price will be dependent of complicity of activity it will generally cost 500 to 2500 per month. WhatsApp message cost will extra (i.e., Rs. 0.90/- per message)`);

        // agent.add(new Suggestion("Custom ChatBot"));
  } catch (e) {
    console.log(e);
  };
};
// ChatBot
// End


// Start
// Enquiry
const handelEnquiry = async (agent) => {
  const product = agent.context.get("enquiry").parameters["product"];

  try {
        agent.add(`Thank you!👌\nFor your interest on our product ${product}.\nPlease provide your contact details.\n\nPlease enter your name:`);
  } catch (e) {
    console.log(e);
  };
};

const handelEnquiryDetails = async (agent) => {
  const company = agent.context.get("enquiry").parameters["company-name"];
  const person = agent.context.get("enquiry").parameters["person-name"];
  const phone = agent.context.get("enquiry").parameters["phone-number"];
  const product = agent.context.get("enquiry").parameters["product"];

  try {
    if ((company !== "") && (person !== "") && (phone !== "") && (product !== "")) {
      // const currentDate = new Date();

      // insert to sheet
      const res = await axios.post(ENQUIRY_SHEETDB_API_URL, 
                                {Company: company.toUpperCase(),
                                 Person: person.toUpperCase(),
                                 Phone: phone,
                                 Note: product});
      
      if (res.data.created > 0) {
        agent.add(`Thank you ${person.toUpperCase()} for your interest on our product ${product}! 👍\nOur sales team will contact (${phone}) you soon.`);
      }
    }
  } catch (e) {
    console.log(e);
  };
};
// Enquiry
// End


// Start
// Customer Support
const handelCustomerSupport = async (agent) => {
  try {
        agent.add(`Sorry, for your inconvenient!🙏\nPlease provide your contact details.\n\nPlease enter your company name:`);
  } catch (e) {
    console.log(e);
  };
};

const handelSupportDetails = async (agent) => {
  const company = agent.context.get("customersupport").parameters["company-name"];
  const person = agent.context.get("customersupport").parameters["person-name"];
  const phone = agent.context.get("customersupport").parameters["phone-number"];
  const note = agent.context.get("customersupport").parameters["issue-note"];

  try {
    if ((company !== "") && (person !== "") && (phone !== "") && (note !== "")) {
      // const currentDate = new Date();

      // insert to sheet
      const res = await axios.post(ENQUIRY_SHEETDB_API_URL, 
                                {Company: company.toUpperCase(),
                                 Person: person.toUpperCase(),
                                 Phone: phone,
                                 Note: note});
      
      if (res.data.created > 0) {
        agent.add(`Thank you ${person.toUpperCase()}! 👍\nOur support team will contact (${phone}) you soon.`);
      }
    }
  } catch (e) {
    console.log(e);
  };
};
// Customer Support
// End

module.exports = {
  handelTest,
  handelMenu,
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
  handelCustomerSupport,
  handelSupportDetails
};