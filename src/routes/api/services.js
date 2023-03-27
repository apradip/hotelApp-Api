const express = require("express");
const router = express.Router();

const { handelSearch, handelDetail, handelCreate, handelUpdate, handelRemove } = require("../../controllers/services");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.OFFICE_STAFF, ROLE_LIST.RESTAURANT_MANAGER, ROLE_LIST.KITCHEN_ADMIN, ROLE_LIST.HOUSEKEEPING), handelSearch)
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.OFFICE_STAFF, ROLE_LIST.RESTAURANT_MANAGER, ROLE_LIST.KITCHEN_ADMIN, ROLE_LIST.HOUSEKEEPING), handelCreate);

router.route("/:hotelId/:_id")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.OFFICE_STAFF, ROLE_LIST.RESTAURANT_MANAGER, ROLE_LIST.KITCHEN_ADMIN, ROLE_LIST.HOUSEKEEPING), handelDetail)
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.OFFICE_STAFF, ROLE_LIST.RESTAURANT_MANAGER, ROLE_LIST.KITCHEN_ADMIN, ROLE_LIST.HOUSEKEEPING), handelUpdate)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.RESTAURANT_MANAGER, ROLE_LIST.KITCHEN_ADMIN, ROLE_LIST.HOUSEKEEPING), handelRemove);
    
module.exports = router;