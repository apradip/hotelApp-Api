const express = require('express');
const router = express.Router();
const { handelTest,
    handelWelcome,
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
    handelSupport,
    handelSupportDetails,
    handelQuit } = require("../../controllers/dialogFlow/df_pixel")

router.route('/')
    .post(handelTest)
    
    .post(handelWelcome)
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
    .post(handelSupport)
    .post(handelSupportDetails)
    .post(handelQuit)
module.exports = router;