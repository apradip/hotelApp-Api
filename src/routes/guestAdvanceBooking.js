const express = require("express");
const router = express.Router();

const { handelAdvanceBooking } = require("../controllers/guestAdvanceBooking");

router.route("/:hotelId")        
    .post(handelAdvanceBooking);        // advance booking 
            
module.exports = router;