const express = require("express");
const router = express.Router();

const {handelSearch, handelDetail, handelCreate, handelUpdate, handelRemove} = require("../../controllers/idDocuments");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.HR_ADMIN), handelSearch)
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN), handelCreate);

router.route("/:_id")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.HR_ADMIN, 
        ROLE_LIST.KITCHEN_ADMIN, 
        ROLE_LIST.RECEPTIONIST, 
        ROLE_LIST.ROOM_SERVICE, 
        ROLE_LIST.HOUSEKEEPING, 
        ROLE_LIST.SERVICE_BOY, 
        ROLE_LIST.RESTAURANT_MANAGER, 
        ROLE_LIST.CHEF, 
        ROLE_LIST.JOUNIER_CHEF, 
        ROLE_LIST.TECHNION, 
        ROLE_LIST.OFFICE_STAFF), handelDetail)
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN), handelUpdate)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN), handelRemove);

module.exports = router;