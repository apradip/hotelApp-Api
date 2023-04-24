const express = require("express");
const router = express.Router();

const { handelSearch, handelDetail, handelCreate, handelUpdate, handelRemove, handelCheckout } = require("../../controllers/guests");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
                    ROLE_LIST.HOTEL_ADMIN, 
                    ROLE_LIST.KITCHEN_ADMIN,
                    ROLE_LIST.OFFICE_STAFF, 
                    ROLE_LIST.RECEPTIONIST, 
                    ROLE_LIST.RESTAURANT_MANAGER), handelSearch)
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
                    ROLE_LIST.HOTEL_ADMIN, 
                    ROLE_LIST.KITCHEN_ADMIN,
                    ROLE_LIST.OFFICE_STAFF, 
                    ROLE_LIST.RECEPTIONIST, 
                    ROLE_LIST.RESTAURANT_MANAGER), handelCreate);

router.route("/:hotelId/:_id")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
                    ROLE_LIST.HOTEL_ADMIN, 
                    ROLE_LIST.KITCHEN_ADMIN,
                    ROLE_LIST.OFFICE_STAFF, 
                    ROLE_LIST.RECEPTIONIST, 
                    ROLE_LIST.RESTAURANT_MANAGER), handelDetail)
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
                    ROLE_LIST.HOTEL_ADMIN, 
                    ROLE_LIST.KITCHEN_ADMIN,
                    ROLE_LIST.OFFICE_STAFF, 
                    ROLE_LIST.RECEPTIONIST, 
                    ROLE_LIST.RESTAURANT_MANAGER), handelCheckout)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
                    ROLE_LIST.HOTEL_ADMIN,
                    ROLE_LIST.KITCHEN_ADMIN, 
                    ROLE_LIST.OFFICE_STAFF, 
                    ROLE_LIST.RESTAURANT_MANAGER), handelRemove);

router.route("/:hotelId/:_id/option")
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
                    ROLE_LIST.HOTEL_ADMIN, 
                    ROLE_LIST.KITCHEN_ADMIN, 
                    ROLE_LIST.OFFICE_STAFF, 
                    ROLE_LIST.RESTAURANT_MANAGER), handelUpdate);
    
module.exports = router;