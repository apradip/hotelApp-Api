const axios = require("axios");

const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MDE3OGY4NDdiNDc4MGJlNDY3MTY5ZSIsIm5hbWUiOiJQaXhlbEluZm8iLCJhcHBOYW1lIjoiQWlTZW5zeSIsImNsaWVudElkIjoiNjUwMTc4Zjg0N2I0NzgwYmU0NjcxNjk5IiwiYWN0aXZlUGxhbiI6Ik5PTkUiLCJpYXQiOjE2OTQ1OTUzMjB9.WIuod7qb1cqZIBEyOkl9MZ4feIW9ofXBS2weL3MS0_U";
const WH_API_URL = "https://backend.api-wa.co/campaign/bot live/api";
const CAMPAIGN_NAME = "send_invoice";
const INVOICE_URL = "https://s3.ap-south-1.amazonaws.com/emaillive.in/invoice/PIPL23-2400384.pdf";
const FILE_TYPE = "Invoice";

const handelSendInvoice = async (req, res) => {
    try {
        const {receiverPhone, receiverName, products, total} = req.body;

        const res = await axios.post(WH_API_URL, 
            {apiKey: API_KEY,
                campaignName: CAMPAIGN_NAME,
                destination: "+91" + receiverPhone,
                userName: receiverName,
                media: {url: INVOICE_URL, filename: FILE_TYPE},
                templateParams: [products, total]});

        if (res.data !== "Success") {
            return false;
        } else {
            return true;
        } 
    } catch (e) {
      console.log(e)
    };

    return true;
};

module.exports = {
    handelSendInvoice
};
  