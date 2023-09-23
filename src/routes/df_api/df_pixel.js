const express = require('express');
const router = express.Router();
const { handelTest, handelCustomerSupport } = require("../../controllers/dialogFlow/df_pixel")

router.route('/')
    .post(handelTest)
    .post(handelCustomerSupport)

module.exports = router;