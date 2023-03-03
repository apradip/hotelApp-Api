const express = require("express");
const router = express.Router();

const { handelDetail, handelCreate, handelRemove, handelSingleDetail, handelSingleRemove } = require("../../controllers/guestRooms");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST), handelCreate)

router.route("/:hotelId/:guestId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN,  ROLE_LIST.RECEPTIONIST), handelDetail)
    // .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST), handelCreate)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST), handelRemove);

router.route("/:hotelId/:guestId/:_id")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST), handelSingleDetail)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RECEPTIONIST), handelSingleRemove);
    
module.exports = router;