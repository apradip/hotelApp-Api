const express = require("express");
const router = express.Router();

const {handelSearch, handelDetail, handelOrder, handelAssignTable, handelDelivery,
    handelGenerateBill, handelCheckout} = require("../../controllers/guestTables");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.CHEF,
        ROLE_LIST.JOUNIER_CHEF), handelSearch);     // search all active guests who are taking food (for the search options)

router.route("/:hotelId/:guestId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.CHEF,
        ROLE_LIST.JOUNIER_CHEF), handelDetail)     //display all food ordered by the guest
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.CHEF,
        ROLE_LIST.JOUNIER_CHEF), handelAssignTable);     //assign table to guest
                
router.route("/:hotelId/:guestId/:transactionId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.CHEF,
        ROLE_LIST.JOUNIER_CHEF), handelGenerateBill)        // generate bill 
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.CHEF,
        ROLE_LIST.JOUNIER_CHEF), handelOrder)       // order food        
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.CHEF,
        ROLE_LIST.JOUNIER_CHEF), handelDelivery)        // delivery food for the previous order
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.CHEF,
        ROLE_LIST.JOUNIER_CHEF), handelCheckout);       // checkout the guest
                                                
module.exports = router;