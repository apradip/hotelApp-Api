const express = require("express");
const router = express.Router();

const {handelSearch, handelDetail, handelBooking, handelGenerateBill, handelCheckout} = require("../../controllers/guestRooms");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.RECEPTIONIST), handelSearch);

router.route("/:hotelId/:guestId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.RECEPTIONIST, 
        ROLE_LIST.OFFICE_STAFF), handelDetail)                    

router.route("/:hotelId/:guestId/:transactionId")        
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.SERVICE_MANAGER), handelGenerateBill)     // generate bill 
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.SERVICE_MANAGER,
        ROLE_LIST.SERVICE_BOY), handelBooking)      // order items        
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.SERVICE_MANAGER,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelCheckout);     // checkout the guest

module.exports = router;