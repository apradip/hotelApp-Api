const express = require("express");
const router = express.Router();

const { handelSendInvoice } = require("../../controllers/dialogFlow/send_invoise");

router.route("/")
    .post(handelSendInvoice);
    
module.exports = router;