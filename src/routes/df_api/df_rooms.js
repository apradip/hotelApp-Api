const express = require('express');
const router = express.Router();
const { handelTest } = require("../../controllers/dialogFlow/df_rooms")

router.route('/')
    .post(handelTest)

module.exports = router;