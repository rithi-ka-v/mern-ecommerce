require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// ROUTES
const authRouter = require("./routes/auth/auth-routes");

const adminProductsRouter = require(
  "./routes/admin/products-routes"
);

const adminOrderRouter = require(
  "./routes/admin/order-routes"
);

const shopProductsRouter = require(
  "./routes/shop/products-routes"
);

const shopCartRouter = require(
  "./routes/shop/cart-routes"
);

const shopAddressRouter = require(
  "./routes/shop/address-routes"
);

const shopOrderRouter = require(
  "./routes/shop/order-routes"
);

const shopSearchRouter = require(
  "./routes/shop/search-routes"
);

const shopReviewRouter = require(
  "./routes/shop/review-routes"
);

const commonFeatureRouter = require(
  "./routes/common/feature-routes"
);

const app = express();

const PORT = process.env.PORT || 5000;

// ================= DATABASE =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log("✅ MongoDB connected")
  )
  .catch((error) => {
    console.error(
      "❌ DB Error:",
      error.message
    );

    process.exit(1);
  });

// ================= CORS =================

app.use(
  cors({
    origin: [
      "http://localhost:5173",

      // ✅ REPLACE WITH YOUR REAL VERCEL URL
      "https://mern-ecommerce-sigma-livid.vercel.app/",
    ],

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

// ================= MIDDLEWARE =================

app.use(cookieParser());

app.use(express.json());

// ================= TEST ROUTE =================

app.get("/", (req, res) => {
  res.send(
    "MERN Ecommerce Backend Running"
  );
});

// ================= API ROUTES =================

app.use("/api/auth", authRouter);

app.use(
  "/api/admin/products",
  adminProductsRouter
);

app.use(
  "/api/admin/orders",
  adminOrderRouter
);

app.use(
  "/api/shop/products",
  shopProductsRouter
);

app.use("/api/shop/cart", shopCartRouter);

app.use(
  "/api/shop/address",
  shopAddressRouter
);

app.use("/api/shop/order", shopOrderRouter);

app.use(
  "/api/shop/search",
  shopSearchRouter
);

app.use(
  "/api/shop/review",
  shopReviewRouter
);

app.use(
  "/api/common/feature",
  commonFeatureRouter
);

// ================= SERVER =================

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});