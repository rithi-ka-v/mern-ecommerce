const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
} = require("../../controllers/shop/products-controller");

const router = express.Router();

// ✅ GET FILTERED PRODUCTS
router.get("/get", getFilteredProducts);

// ✅ GET SINGLE PRODUCT DETAILS
router.get("/get/:id", getProductDetails);

module.exports = router;