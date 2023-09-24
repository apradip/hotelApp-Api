const express = require('express');
const router = express.Router();
const { handelTest,
        handelMenu,
        handelProductMenu,
        handelServerCategoryMenu,
        handelDedicatedServerOSMenu,
        handelDedicatedWindows,
        handelDedicatedLinux,
        handelVPSOSMenu,
        handelVPSWindows,
        handelVPSLinux,
        handelSharedServer,
        handelEmail,
        handelChatBot,
        handelEnquiry,
        handelEnquiryDetails,
        handelCustomerSupport,
        handelSupportDetails } = require("../../controllers/dialogFlow/df_pixel")

router.route('/')
    .post(handelTest)
    .post(handelMenu)
    .post(handelProductMenu)
    .post(handelServerCategoryMenu)
    .post(handelDedicatedServerOSMenu)
    .post(handelDedicatedWindows)
    .post(handelDedicatedLinux)
    .post(handelVPSOSMenu)
    .post(handelVPSWindows)
    .post(handelVPSLinux)
    .post(handelSharedServer)
    .post(handelEmail)
    .post(handelChatBot)
    .post(handelEnquiry)
    .post(handelEnquiryDetails)
    .post(handelCustomerSupport)
    .post(handelSupportDetails)
module.exports = router;