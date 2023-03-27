const express = require("express");
const router = express.Router();

const { handelDetail, handelTableBooking, handelOrder, handelDelivery, handelCheckout } = require("../../controllers/guestTableFoods");

const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId/:guestId/:option")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
                        ROLE_LIST.HOTEL_ADMIN, 
                        ROLE_LIST.KITCHEN_ADMIN,
                        ROLE_LIST.OFFICE_STAFF,
                        ROLE_LIST.RECEPTIONIST,
                        ROLE_LIST.RESTAURANT_MANAGER), handelDetail);

router.route("/:hotelId/:guestId")
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
                        ROLE_LIST.HOTEL_ADMIN, 
                        ROLE_LIST.KITCHEN_ADMIN,
                        ROLE_LIST.OFFICE_STAFF,
                        ROLE_LIST.RECEPTIONIST,
                        ROLE_LIST.RESTAURANT_MANAGER), handelTableBooking)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
                        ROLE_LIST.HOTEL_ADMIN, 
                        ROLE_LIST.KITCHEN_ADMIN,
                        ROLE_LIST.OFFICE_STAFF,
                        ROLE_LIST.RECEPTIONIST,
                        ROLE_LIST.RESTAURANT_MANAGER), handelCheckout);
                    
router.route("/:hotelId/:guestId/:tableId")
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
                        ROLE_LIST.RESTAURANT_MANAGER), handelDelivery);
            
module.exports = router;