// ✅ Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import { io } from "../index.js";

const router = express.Router();

// 🧾 Initialize Razorpay
console.log("🔑 Razorpay Keys Loaded:", {
  id: process.env.RAZORPAY_KEY_ID,
  secret: process.env.RAZORPAY_KEY_SECRET ? "✅ Present" : "❌ Missing",
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------------------------------------------------
// 🧩 1️⃣ Create Razorpay Order (frontend requests this)
// ---------------------------------------------------
router.post("/create-order", async (req, res) => {
  try {
    const { orderId } = req.body;

    // Fetch order from DB
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Calculate total (convert to paise)
    const amount = Math.round(order.total * 100);

    // Create Razorpay order
    const options = {
      amount,
      currency: "INR",
      receipt: `order_rcptid_${orderId}`,
      notes: { orderId: order._id.toString() },
    };

    const razorOrder = await razorpay.orders.create(options);

    // Update DB with Razorpay order info
    await Order.findByIdAndUpdate(orderId, {
      razorpayOrderId: razorOrder.id,
      status: "Pending Payment",
    });

    res.json({
      success: true,
      order: razorOrder,
      key: process.env.RAZORPAY_KEY_ID, // send to frontend
    });
  } catch (err) {
    console.error("❌ Error creating Razorpay order:", err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

// ---------------------------------------------------
// 🧩 2️⃣ Verify Razorpay Payment (after successful payment)
// ---------------------------------------------------
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Verify the signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("❌ Invalid payment signature");
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // ✅ Payment verified — update order in DB
    await Order.findByIdAndUpdate(orderId, {
      status: "Processing",
      paymentResult: {
        id: razorpay_payment_id,
        order_id: razorpay_order_id,
        signature: razorpay_signature,
      },
      updatedAt: Date.now(),
    });

    // Notify via Socket.io (real-time)
    io.to(`order_${orderId}`).emit("order_update", {
      orderId,
      status: "Processing",
    });

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (err) {
    console.error("❌ Payment verification error:", err);
    res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
});

// ---------------------------------------------------
// 🧩 3️⃣ Test Route — Verify Razorpay Keys
// ---------------------------------------------------
router.get("/test", async (req, res) => {
  try {
    const account = await razorpay.customers.all({ count: 1 });
    res.json({ success: true, message: "Razorpay keys are valid" });
  } catch (err) {
    console.error("❌ Razorpay test failed:", err.message);
    res.status(500).json({
      success: false,
      message: "Invalid Razorpay credentials or network issue",
    });
  }
});

export default router;
