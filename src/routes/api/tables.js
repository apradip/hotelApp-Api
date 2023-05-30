const express = require("express");
const router = express.Router();

const {handelSearch, handelDetail, handelCreate, handelUpdate, handelRemove} = require("../../controllers/tables");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.OFFICE_STAFF, ROLE_LIST.RECEPTIONIST), handelSearch)
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.OFFICE_STAFF, ROLE_LIST.RECEPTIONIST), handelCreate);

router.route("/:hotelId/:_id")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.OFFICE_STAFF, ROLE_LIST.RECEPTIONIST), handelDetail)
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.OFFICE_STAFF), handelUpdate)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN), handelRemove);
    
module.exports = router;