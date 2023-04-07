const express = require("express");
const router = express.Router();

const { handelDetail, handelOrder, handelDelivery, handelCheckout } = require("../../controllers/guestMiscellaneouses");

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
                        ROLE_LIST.RESTAURANT_MANAGER), handelOrder);

router.route("/:hotelId/:guestId/:transactionId")
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
                        ROLE_LIST.HOTEL_ADMIN, 
                        ROLE_LIST.KITCHEN_ADMIN,
                        ROLE_LIST.OFFICE_STAFF,
                        ROLE_LIST.RECEPTIONIST,
                        ROLE_LIST.RESTAURANT_MANAGER), handelDelivery)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
                        ROLE_LIST.HOTEL_ADMIN, 
                        ROLE_LIST.KITCHEN_ADMIN,
                        ROLE_LIST.OFFICE_STAFF,
                        ROLE_LIST.RECEPTIONIST,
                        ROLE_LIST.RESTAURANT_MANAGER), handelCheckout);
                                            
module.exports = router;