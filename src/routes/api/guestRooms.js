const express = require("express");
const router = express.Router();

const {handelSearch, handelDetail, handelBooking, 
    handelGenerateBill, handelPayment, handelCheckout} = require("../../controllers/guestRooms");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelSearch);     // search all active guests who are staying at rooms (for the search options)

router.route("/:hotelId/:guestId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.RECEPTIONIST, 
        ROLE_LIST.OFFICE_STAFF), handelDetail)        //display all rooms occupied by the guest            
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelCheckout);     // checkout the guest

router.route("/:hotelId/:guestId/:transactionId")        
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelGenerateBill)     // generate bill 
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelBooking)         // room booking     
        
router.route("/:hotelId/:guestId/:expenseId/:billId")        
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelPayment);        // payment 
           

module.exports = router;