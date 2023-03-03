const express = require("express");
const router = express.Router();

const { handelSearch, handelDetail, handelCreate, handelUpdate, handelRemove } = require("../../controllers/guests");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");

router.route("/:hotelId")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.JOUNIER_CHEF), handelSearch)
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.JOUNIER_CHEF), handelCreate);

router.route("/:hotelId/:_id")
    .get(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.JOUNIER_CHEF), handelDetail)
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.JOUNIER_CHEF), handelUpdate)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, ROLE_LIST.HOTEL_ADMIN, ROLE_LIST.JOUNIER_CHEF), handelRemove);
    
module.exports = router;