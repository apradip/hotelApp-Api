const express = require("express");
const router = express.Router();

// const {handelDetail, handelCreate, handelUpdate, handelRemove} = require("../../controllers/guestPayments");
const { handelAdvancePayment } = require("../../controllers/guestPayments");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId/:guestId")
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN, 
        ROLE_LIST.OFFICE_STAFF, 
        ROLE_LIST.RESTAURANT_MANAGER), handelAdvancePayment);    

module.exports = router;