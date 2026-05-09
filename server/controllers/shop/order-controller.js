const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

// ===================== CREATE ORDER =====================

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      totalAmount,
      cartId,
    } = req.body;

    const create_payment_json = {
      intent: "sale",

      payer: {
        payment_method: "paypal",
      },

      redirect_urls: {
        return_url: "http://localhost:5173/shop/paypal-return",
        cancel_url: "http://localhost:5173/shop/paypal-cancel",
      },

      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,

              sku: item.productId,

              // ✅ FIXED SALE PRICE
              price: Number(
                item.salePrice > 0
                  ? item.salePrice
                  : item.price
              ).toFixed(2),

              currency: "USD",

              quantity: item.quantity,
            })),
          },

          amount: {
            currency: "USD",

            total: Number(totalAmount).toFixed(2),
          },

          description: "E-commerce Order Payment",
        },
      ],
    };

    paypal.payment.create(
      create_payment_json,
      async (error, paymentInfo) => {
        if (error) {
          console.log("PAYPAL ERROR:", error);

          return res.status(500).json({
            success: false,
            message: "PayPal payment creation failed",
          });
        }

        // ✅ SAFE approval URL extraction
        const approvalURL = paymentInfo?.links?.find(
          (link) => link.rel === "approval_url"
        )?.href;

        if (!approvalURL) {
          return res.status(500).json({
            success: false,
            message: "Approval URL not found",
          });
        }

        // ✅ CREATE ORDER
        const newOrder = new Order({
          userId,
          cartId,
          cartItems,
          addressInfo,

          paymentMethod: "paypal",
          paymentStatus: "pending",
          orderStatus: "pending",

          totalAmount,

          paymentId: paymentInfo.id,
        });

        await newOrder.save();

        return res.status(201).json({
          success: true,
          approvalURL,
          orderId: newOrder._id,
        });
      }
    );
  } catch (e) {
    console.log("SERVER ERROR:", e);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== CAPTURE PAYMENT =====================

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ✅ UPDATE ORDER STATUS
    order.paymentStatus = "paid";

    order.orderStatus = "confirmed";

    order.paymentId = paymentId;

    order.payerId = payerId;

    // ✅ STOCK VALIDATION + REDUCE STOCK
    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // ✅ STOCK CHECK
      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.title}`,
        });
      }

      // ✅ REDUCE STOCK
      product.totalStock -= item.quantity;

      await product.save();
    }

    // ✅ CLEAR CART
    await Cart.findByIdAndDelete(order.cartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed successfully",
      data: order,
    });
  } catch (e) {
    console.log("CAPTURE ERROR:", e);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== GET USER ORDERS =====================

const getAllOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    console.log("USER ID RECEIVED:", userId);

    const orders = await Order.find({ userId });

    console.log("ORDERS FROM DB:", orders);

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== ORDER DETAILS =====================

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};