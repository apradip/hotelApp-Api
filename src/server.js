require("dotenv").config();
const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const {Server} = require("socket.io");
const jwt = require("jsonwebtoken");

const corsOptions = require("./config/corsOptions");
const socketRoom = require("./config/socketList");

const {logger} = require("./middlewares/logEvents");
const errorHandler = require("./middlewares/errorHandler");
const verifyJWT = require("./middlewares/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middlewares/credentials");
const connectDB = require("./config/dbConn");

//for google dialog flow client
const {WebhookClient} = require("dialogflow-fulfillment");

const PORT_HTTPS_EXPRESS = process.env.API_SERVER_HTTPS_PORT || process.env.API_SERVER_HTTPS_PORT_ALTERNATIVE;

const sslCredential = {
    key: fs.readFileSync(process.env.API_SERVER_SSL_KEY_FILE, "utf8"),
    cert: fs.readFileSync(process.env.API_SERVER_SSL_CERT_FILE, "utf8")
};

//dialog flow api code file
const { SchoolWelcomeHandler,
        SchoolIndividualMenuHandler,
        SchoolIndividualDataHandler,
        SchoolDistrictStaticsMenuHandler,
        SchoolDistrictStaticsHandler,
        SchoolQuitHandler
} = require("./controllers/dialogFlow/df_school");

const { handelHotelDemo, 
        handelHotelWelcome,
        handelHotelPlaceList,
        handelHotelSetPlace,
        handelHotelSetStartDate,
        handelHotelSetDayCount,
        handelHotelSetRoomCategory,
        handelHotelSetRoomCategoryFollowupYes,
        handelHotelSetRoomCategoryFollowupNo,
        // handelRoomEnquiry, 
        // handelHotelRoomCategoryBrochier
        // handelRoomBooking, 
        // handelPaymentRealising, 
        // handelCancellation 
        handelHotelQuit
} = require("./controllers/dialogFlow/df_rooms");

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
} = require("./controllers/dialogFlow/df_pixel");


const app = express();
const httpsServer = https.createServer(sslCredential, app);


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
  
//middleware for cookies
app.use(cookieParser());

app.get("/api", (req, res) => {
    res.send("HotelApp Restfull API server is live...");
});

app.post("/wh/api/school", express.json(), (req, res) => {
    const agent = new WebhookClient({ 
        request: req, 
        response: res 
    });

    const intentMap = new Map();
    
    intentMap.set("welcome", SchoolWelcomeHandler);

    
    intentMap.set("quit.event", SchoolQuitHandler);
    intentMap.set("quit", SchoolQuitHandler);

    intentMap.set("get.individual.school.menu", SchoolIndividualMenuHandler);
    intentMap.set("get.individual.school.details", SchoolIndividualDataHandler);

    intentMap.set("get.statics.district.menu", SchoolDistrictStaticsMenuHandler);
    intentMap.set("get.statics.district.details", SchoolDistrictStaticsHandler);


    agent.handleRequest(intentMap);
});

app.post("/wh/api/hotel", express.json(), (req, res) => {
    const agent = new WebhookClient({ 
        request: req, 
        response: res 
    });

    const intentMap = new Map();
    intentMap.set("demo", handelHotelDemo);
    
    intentMap.set("welcome", handelHotelWelcome);
    intentMap.set("get.place.menu", handelHotelPlaceList);
    intentMap.set("set.place", handelHotelSetPlace);
    intentMap.set("set.start.date", handelHotelSetStartDate);
    intentMap.set("set.day.count", handelHotelSetDayCount);
    intentMap.set("set.room.category", handelHotelSetRoomCategory);
    intentMap.set("set.room.category - yes", handelHotelSetRoomCategoryFollowupYes);
    intentMap.set("set.room.category - no", handelHotelSetRoomCategoryFollowupNo);
    //intentMap.set("GetBorderCountYesIntent", handelRoomEnquiry);
    // intentMap.set("get.room.category.brochier", handelHotelRoomCategoryBrochier);
    
    intentMap.set("quit.event", handelHotelQuit);
    intentMap.set("quit", handelHotelQuit);

    agent.handleRequest(intentMap);
});

app.post("/wh/api/pixel", express.json(), (req, res) => {
    try {
        const agent = new WebhookClient({ 
            request: req, 
            response: res 
        });

        const intentMap = new Map();
    
        intentMap.set("test", handelTest);
        
        intentMap.set("welcome", handelWelcome);

        intentMap.set("get.product.menu", handelProductMenu);
        
        intentMap.set("get.server.menu", handelServerCategoryMenu);
        
        intentMap.set("get.dedicated.os.menu", handelDedicatedServerOSMenu);
        intentMap.set("get.dedicated.windows.product", handelDedicatedWindows);
        intentMap.set("get.dedicated.linux.product", handelDedicatedLinux);
    
        intentMap.set("get.vps.os.menu", handelVPSOSMenu);
        intentMap.set("get.vps.windows.product", handelVPSWindows);
        intentMap.set("get.vps.linux.product", handelVPSLinux);

        intentMap.set("get.server.share.product", handelSharedServer);

        intentMap.set("get.email.product", handelEmail);

        intentMap.set("get.chatbot.product", handelChatBot);

        intentMap.set("get.enquiry", handelEnquiry);
        intentMap.set("post.enquery.details", handelEnquiryDetails);

        intentMap.set("get.customersupport", handelSupport);
        intentMap.set("post.customersupport.details", handelSupportDetails);

        intentMap.set("quit.event", handelQuit);
        intentMap.set("quit", handelQuit);
        
        agent.handleRequest(intentMap);
    } catch (e) {
        console.log(e);
    }
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

//listen https server
httpsServer.listen(PORT_HTTPS_EXPRESS, () => {
    console.log(`node - https server is running on ${PORT_HTTPS_EXPRESS}...`);
});

const socketIo = new Server(httpsServer, {
    cors: {
        // origin: `${process.env.FRONTEND_SERVER_URI}:${process.env.FRONTEND_SERVER_PORT}`,
        origin: `*`,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTION"]
    }
});

socketIo.on("connection", (socket) => {
    try {
        // Verify the token here and get user info from JWT token.
        const token = socket.handshake.auth.token;
    
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            (err, decoded) => {
                if (err) { 
                    socket.disconnect(true);
                } else {
                    console.log(`Socket connected id : ${socket.id} with user ${decoded.UserInfo.userid}`);
                }
            }
        );
    } catch (error) {
        socket.disconnect(true);
    }

    socket.on("disconnect", (socket) => {
        try {
            console.log(`Socket disconnected: ${socket.id}`);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on(socketRoom.MISCELLANEOUS, (data) => {
        try {
            socket.broadcast.emit(socketRoom.MISCELLANEOUS, data);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on(socketRoom.SERVICE, (data) => {
        try {
            socket.broadcast.emit(socketRoom.SERVICE, data);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on(socketRoom.TABLE, (data) => {
        try {
            socket.broadcast.emit(socketRoom.TABLE, data);
       } catch (error) {
            console.log(error);
        }
    });

    socket.on(socketRoom.ROOM, (data) => {
        try {
            socket.broadcast.emit(socketRoom.ROOM, data);
        } catch (error) {
            console.log(error);
        }
    });
});