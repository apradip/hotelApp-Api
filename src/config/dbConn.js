const mongoose = require("mongoose");

const connectDB = async () => {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.DATABASE_URI, {
                            useUnifiedTopology: true,
                            useNewUrlParser: true
                    }).then(() => {
        console.log("db - hotelApp connected...");
    }).catch((e) => {
        console.log(`db - hotelApp not connected...\n${e.message}`);
    });
};

module.exports = connectDB;