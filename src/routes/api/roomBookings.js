const express = require("express");
const router = express.Router();

const { handelSearch, handelDetail, handelCreate, handelRemove } = require("../../controllers/roomBookings");

const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST), handelSearch)
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST), handelCreate);

router.route("/:hotelId/:_id")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST, ROLE_LIST.OFFICE_STAFF), handelDetail)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST), handelRemove);

// router.route("/:hotelId")
    

module.exports = router;