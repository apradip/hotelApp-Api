const express = require("express");
const router = express.Router();

const {handelSearch, handelDetail, handelCreate, handelUpdate, handelRemove} = require("../../controllers/guestExpensesPayments");
const ROLE_LIST = require("../../config/roleList");
const verifyRoles = require("../../middlewares/verifyRoles");
    
router.route("/:hotelId/:guestId")    
    .post(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
                    ROLE_LIST.HOTEL_ADMIN, 
                    ROLE_LIST.RECEPTIONIST, 
                    ROLE_LIST.RESTAURANT_MANAGER, 
                    ROLE_LIST.OFFICE_STAFF), handelCreate);

router.route("/:hotelId/:guestId/:transactionId")    
    .put(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.RECEPTIONIST, 
        ROLE_LIST.RESTAURANT_MANAGER, 
        ROLE_LIST.OFFICE_STAFF), handelUpdate)
    .delete(verifyRoles(ROLE_LIST.SYSTEM_ADMIN, 
        ROLE_LIST.HOTEL_ADMIN, 
        ROLE_LIST.RECEPTIONIST, 
        ROLE_LIST.RESTAURANT_MANAGER, 
        ROLE_LIST.OFFICE_STAFF), handelRemove);
    
module.exports = router;