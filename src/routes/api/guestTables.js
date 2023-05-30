const express = require("express");
const router = express.Router();

const {handelSearch, handelDetail, handelOrder, handelGenerateBill, handelCheckout, handelBillDetail, handelDelivery} = require("../../controllers/guestTables");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER), handelSearch);

router.route("/:hotelId/:guestId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER), handelDetail)
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER), handelOrder)
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER), handelGenerateBill)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER), handelCheckout);
            
router.route("/:hotelId/:guestId/:transactionId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER), handelBillDetail)
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN,
        ROLE_LIST.OFFICE_STAFF,
        ROLE_LIST.RECEPTIONIST,
        ROLE_LIST.RESTAURANT_MANAGER), handelDelivery);
                                            
module.exports = router;