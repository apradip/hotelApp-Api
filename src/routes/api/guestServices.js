const express = require("express");
const router = express.Router();

const {handelSearch, handelDetail, handelOrder, handelDelivery, 
       handelGenerateBill, handelCheckout} = require("../../controllers/guestServices");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.SERVICE_MANAGER,
        ROLE_LIST.SERVICE_BOY), handelSearch);    // search all active guests who are taking service (for the search options)

router.route("/:hotelId/:guestId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.SERVICE_MANAGER,
        ROLE_LIST.SERVICE_BOY), handelDetail);    //display all items ordered by the guest
            
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
        ROLE_LIST.SERVICE_BOY), handelOrder)      // order items        
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.SERVICE_MANAGER,
        ROLE_LIST.SERVICE_BOY), handelDelivery)   // delivery items for the previous order
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.SERVICE_MANAGER), handelCheckout);    // checkout the guest

module.exports = router;