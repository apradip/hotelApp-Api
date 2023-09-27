require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
// const http = require("http");
const https = require("https");
const fs = require("fs");
const { Server } = require("socket.io");
const { WebhookClient } = require('dialogflow-fulfillment');
const socketOptions = require("./config/socketOptions");
const { logger } = require("./middlewares/logEvents");
const errorHandler = require("./middlewares/errorHandler");
const verifyJWT = require("./middlewares/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middlewares/credentials");
const connectDB = require("./config/dbConn");

//dialog flow api code file
const { handelDemo, 
        handelPlaceList,
        handelGetPlace,
        handelGetStartDate,
        handelGetNoOfDays,
        handelGetNoOfBoders,
        handelRoomEnquiry, 
        handelRoomCategoryBrochier
        // handelRoomBooking, 
        // handelPaymentRealising, 
        // handelCancellation 
    } = require('./controllers/dialogFlow/df_rooms');

    const { 
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
    } = require('./controllers/dialogFlow/df_pixel');

// const PORT_HTTP_EXPRESS = process.env.API_HTTP_SERVER_PORT || 3500;
const PORT_HTTPS_EXPRESS = process.env.API_HTTPS_SERVER_PORT || 3511;
const PORT_SOCKET = process.env.SOCKET_PORT || 3600; 

const httpsOptions = {
    key: fs.readFileSync(process.env.API_SERVER_SSL_KEY_FILE, "utf8"),
    cert: fs.readFileSync(process.env.API_SERVER_SSL_CERT_FILE, "utf8")
};

const messageRoom = {
    Room: "SOCKET_ROOM",
    Table: "SOCKET_TABLE",
    Service: "SOCKET_SERVICE",
    Miscellaneous: "SOCKET_MISCELLANEOUS"
};
 
// Connect to MongoDB
connectDB();

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

// create and run node server
// const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);

// // create & run socket server for front end communication
// const io = new Server(httpServer, {
//     cors: {
//       origin: `${socketOptions.SOCKET_SETTINGS.host}:${socketOptions.SOCKET_SETTINGS.port}`,
//       methods: ["GET", "POST"]
//     }
// });

const io = new Server(httpsServer, {
    cors: {
      origin: `${socketOptions.SOCKET_SETTINGS.host}:${socketOptions.SOCKET_SETTINGS.port}`,
      methods: ["GET", "POST"]
    }
});
  
io.on("connection", (socket) => {
    // console.log(`User Connected: ${socket.id}`);
  
    // socket.on("join_room", (data) => {
    //     // console.log("join_room" + data);
    //     socket.join(data);
    // });
  
    // socket.on("send_message", (data) => {
    //     // console.log("send_message" + data);
    //     socket.broadcast.emit("receive_message", data);
    //     // socket.to(data.room).emit("receive_message", data);
    // });

    socket.on(messageRoom.Miscellaneous, (message) => {
        socket.broadcast.emit(messageRoom.Miscellaneous, message);
    });

    socket.on(messageRoom.Service, (message) => {
        socket.broadcast.emit(messageRoom.Service, message);
    });

    socket.on(messageRoom.Table, (message) => {
        socket.broadcast.emit(messageRoom.Table, message);
    });

    socket.on(messageRoom.Room, (message) => {
        socket.broadcast.emit(messageRoom.Room, message);
    });
});
  
//middleware for cookies
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("HotelApp Restfull API server is live...");
});

// app.get('*', function (req, res) {
//     var file = path.join(dir, req.path.replace(/\/$/, '/th_0.jpeg'));
//     // if (file.indexOf(dir + path.sep) !== 0) {
//     //     return res.status(403).end('Forbidden');
//     // }
//     // var type = mime[path.extname(file).slice(1)] || 'text/plain';
//     var s = fs.createReadStream(file);
//     s.on('open', function () {
//         res.set('Content-Type', 'image-jpeg');
//         s.pipe(res);
//     });
//     // s.on('error', function () {
//     //     res.set('Content-Type', 'text/plain');
//     //     res.status(404).end('Not found');
//     // });
// });



app.post("/wh/api/", express.json(), (req, res) => {
    const agent = new WebhookClient({ 
        request: req, 
        response: res 
    });

    const intentMap = new Map();
    intentMap.set("DemoIntent", handelDemo);
    
    intentMap.set("PlaceListIntent", handelPlaceList);
    intentMap.set("GetPlaceIntent", handelGetPlace);
    intentMap.set("GetStartDateIntent", handelGetStartDate);
    intentMap.set("GetNoOfDayToStayIntent", handelGetNoOfDays);
    intentMap.set("GetBorderCountIntent", handelGetNoOfBoders);
    intentMap.set("GetBorderCountYesIntent", handelRoomEnquiry);
    intentMap.set("GetRoomCategoryBrochierIntent", handelRoomCategoryBrochier);
    
    agent.handleRequest(intentMap);
});



app.post("/wh/api/pixel", express.json(), (req, res) => {
    const agent = new WebhookClient({ 
        request: req, 
        response: res 
    });

    const intentMap = new Map();
    
    intentMap.set("test", handelTest);

    
    intentMap.set("welcome", handelWelcome);


    intentMap.set("get.product.menu", handelProductMenu);
    
    intentMap.set("get.product.server.menu", handelServerCategoryMenu);
    
    intentMap.set("get.product.server.dedicated.os.menu", handelDedicatedServerOSMenu);
    intentMap.set("get.product.server.dedicated.windows.product", handelDedicatedWindows);
    intentMap.set("get.product.server.dedicated.linux.product", handelDedicatedLinux);
    
    intentMap.set("get.product.server.vps.os.menu", handelVPSOSMenu);
    intentMap.set("get.product.server.vps.windows.product", handelVPSWindows);
    intentMap.set("get.product.server.vps.linux.product", handelVPSLinux);

    intentMap.set("get.product.server.share.product", handelSharedServer);

    intentMap.set("get.product.email.product", handelEmail);

    intentMap.set("get.product.chatbot.product", handelChatBot);

    intentMap.set("get.enquiry.enquiry", handelEnquiry);
    intentMap.set("post.enquerydetails.enquiry", handelEnquiryDetails);
    

    intentMap.set("get.customersupport.support", handelSupport);
    intentMap.set("post.customerdetails.support", handelSupportDetails);

    intentMap.set("quit.event", handelQuit);
    intentMap.set("quit", handelQuit);
    agent.handleRequest(intentMap);
});


//send invoice through whatsApp
app.use("/api/sendinvoice", require("./routes/df_api/send_invoice"));



//start apis for front end
//login
app.use("/api/login", require("./routes/auth"));

//refresh token
app.use("/api/refreshToken", require("./routes/refreshToken"));

//forget password
app.use("/api/forgetPassword", require("./routes/forgetPassword"));

//find user
//query string : hotel id / user name
app.use("/api/users", require("./routes/findUser"));


app.use(verifyJWT);

//logout
app.use("/api/logout", require("./routes/logout"));

//change password api
app.use("/api/changePassword", require("./routes/changePassword"));

//hotel CURD api
app.use("/api/hotels", require("./routes/api/hotels"));

//GST CURD api
app.use("/api/gsts", require("./routes/api/gsts"));

//access levels CURD api
app.use("/api/accessLevels", require("./routes/api/accessLevels"));

//id documents CURD api
app.use("/api/idDocuments", require("./routes/api/idDocuments"));

//booking agents CURD api
app.use("/api/bookingAgents", require("./routes/api/bookingAgents"));

//employees CURD api
app.use("/api/employees", require("./routes/api/employees"));

//plans CURD api
app.use("/api/plans", require("./routes/api/plans"));

//roomCategories CURD api
app.use("/api/roomCategories", require("./routes/api/roomCategories"));

//rooms CURD api
app.use("/api/rooms", require("./routes/api/rooms"));

//tables CURD api
app.use("/api/tables", require("./routes/api/tables"));

//foods CURD api
app.use("/api/foods", require("./routes/api/foods"));

//miscellaneouses CURD api
app.use("/api/miscellaneouses", require("./routes/api/miscellaneouses"));

//services CURD api
app.use("/api/services", require("./routes/api/services"));

//guests CURD api
app.use("/api/guests", require("./routes/api/guests"));

//guestRooms CURD api
app.use("/api/guestRooms", require("./routes/api/guestRooms"));

//guestitems CURD apiRoomMiscellaneouses
app.use("/api/guestMiscellaneouses", require("./routes/api/guestMiscellaneouses"));

//guestitems CURD apiRoomServices
app.use("/api/guestServices", require("./routes/api/guestServices"));

//guests CURD api
app.use("/api/guestTables", require("./routes/api/guestTables"));

//guestpayments CURD api
app.use("/api/guestPayments", require("./routes/api/guestPayments"));

//guestexpensepayments CURD api
app.use("/api/guestExpensesPayments", require("./routes/api/guestExpensesPayments"));

app.use(errorHandler);

app.listen(PORT_SOCKET, () => {
    console.log(`Socket server is running on ${PORT_SOCKET}...`);
});

// //listen http server
// httpServer.listen(PORT_HTTP_EXPRESS, () => {
//     console.log(`Node http server is running on ${PORT_HTTP_EXPRESS}...`);
// });

//listen https server
httpsServer.listen(PORT_HTTPS_EXPRESS, () => {
    console.log(`Node https server is running on ${PORT_HTTPS_EXPRESS}...`);
});