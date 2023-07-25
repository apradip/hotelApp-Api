const express = require("express");
const router = express.Router();

const {handelSearch, handelDetail, handelOrder, handelDelivery, 
    handelGenerateBill, handelPayment, handelCheckout} = require("../../controllers/guestMiscellaneouses");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.SERVICE_MANAGER,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelSearch);     // search all active guests who are taking miscellaneous (for the search options)

router.route("/:hotelId/:guestId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.SERVICE_MANAGER,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelDetail)       //display all miscellaneous items ordered by the guest
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.SERVICE_MANAGER,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelCheckout);     // checkout the guest
    
router.route("/:hotelId/:guestId/:transactionId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.SERVICE_MANAGER,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelGenerateBill)      // generate bill 
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.SERVICE_MANAGER,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelOrder)     // order items
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.SERVICE_MANAGER,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelDelivery);      // delivery items for the previous order

router.route("/:hotelId/:guestId/:expenseId/:billId")        
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.SERVICE_ADMIN,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.SERVICE_MANAGER,
        ROLE_LIST.RESTAURANT_MANAGER,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST), handelPayment);     // payment 

module.exports = router;