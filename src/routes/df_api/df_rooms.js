const express = require('express');
const router = express.Router();
// const { handelTest, handelRoomAvailabilityEnquiry } = require("../../controllers/dialogFlow/df_rooms")
const { handelTest } = require("../../controllers/dialogFlow/df_rooms")

router.route('/')
    .post(handelTest)
    // .post(handelTest, handelRoomAvailabilityEnquiry)

module.exports = router;