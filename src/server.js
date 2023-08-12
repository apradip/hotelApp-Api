require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const http = require("http");
const { Server } = require("socket.io");
const socketOptions = require("./config/socketOptions");
const { logger } = require("./middlewares/logEvents");
const errorHandler = require("./middlewares/errorHandler");
const verifyJWT = require("./middlewares/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middlewares/credentials");
const connectDB = require("./config/dbConn");

const PORT_EXPRESS = process.env.API_SERVER_PORT || 3500;
const PORT_SOCKET = process.env.SOCKET_PORT || 3600; 

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

// create and run socket server
const serverSocket = http.createServer(app);

const io = new Server(serverSocket, {
    cors: {
      origin: `${socketOptions.SOCKET_SETTINGS.host}:${socketOptions.SOCKET_SETTINGS.port}`,
      methods: ["GET", "POST"]
    }
});
  
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
  
    socket.on("join_room", (data) => {
        // console.log("join_room" + data);
        socket.join(data);
    });
  
    socket.on("send_message", (data) => {
        // console.log("send_message" + data);
        socket.broadcast.emit("receive_message", data);
        // socket.to(data.room).emit("receive_message", data);
    });

    socket.on("M_order", (guestId) => {
        // console.log("send_message" + data);
        socket.broadcast.emit("M_order", guestId);
        // socket.to(data.room).emit("receive_message", data);
    });

    socket.on("S_order", (guestId) => {
        // console.log("send_message" + data);
        socket.broadcast.emit("S_order", guestId);
        // socket.to(data.room).emit("receive_message", data);
    });

    socket.on("T_order", (guestId) => {
        // console.log("send_message" + data);
        socket.broadcast.emit("T_order", guestId);
        // socket.to(data.room).emit("receive_message", data);
    });

});
  

//middleware for cookies
app.use(cookieParser());

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


app.get("/", (req, res) => {
    res.send("HotelApp Restfull API server is running...");
});

app.use(errorHandler);

app.listen(PORT_EXPRESS, () => {
    console.log(`Node server is running on ${PORT_EXPRESS}...`);
});

serverSocket.listen(PORT_SOCKET, () => {
    console.log(`Socket server is running on ${PORT_SOCKET}...`);
});