const express = require("express");
const router = express.Router();

const { handelSearch, handelDetail, handelCreate, handelUpdate, handelRemove } = require("../../controllers/guestExpensesPayments");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST, ROLE_LIST.RESTAURANT_MANAGER, ROLE_LIST.OFFICE_STAFF), handelSearch)
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST, ROLE_LIST.RESTAURANT_MANAGER, ROLE_LIST.OFFICE_STAFF), handelCreate);

router.route("/:hotelId/:_id")
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST, ROLE_LIST.RESTAURANT_MANAGER, ROLE_LIST.OFFICE_STAFF), handelUpdate)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST, ROLE_LIST.RESTAURANT_MANAGER, ROLE_LIST.OFFICE_STAFF), handelRemove);

router.route("/:hotelId/:id/:option")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST, ROLE_LIST.RESTAURANT_MANAGER, ROLE_LIST.OFFICE_STAFF), handelDetail)

    
module.exports = router;