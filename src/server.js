require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middlewares/logEvents");
const errorHandler = require("./middlewares/errorHandler");
const verifyJWT = require("./middlewares/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middlewares/credentials");
const connectDB = require("./config/dbConn");
const PORT = process.env.API_SERVER_PORT || 3500;

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




app.get("/", (req, res) => {
    res.send("HotelApp Restfull API server is running...");
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Node server is running on ${PORT}...`);
})