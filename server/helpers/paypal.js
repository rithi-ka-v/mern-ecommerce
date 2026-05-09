const paypal = require("paypal-rest-sdk");


paypal.configure({
  mode: "sandbox",
  client_id: "AYLXbAScFrnV-R9icuPWFHhLKIWo5YJZPjq1ySh4h70Gsuv_oRZa4FtCFPFVPlY6SgDTF_6ap_ChrMZG",
  client_secret: "EM6qiBt3P9dyKopx9Qhlc1XaLmVUmvEInm5QPGajdKeSMWzOnxp1RXAx_D9nubLdWIXRr3hxrDVN_c4R",
});
module.exports = paypal;
