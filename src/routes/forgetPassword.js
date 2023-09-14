const express = require("express");
const router = express.Router();

const { handelSendOtp } = require("../controllers/forgetPassword");

router.route("/:hotelId")
    .put(handelSendOtp);

module.exports = router;