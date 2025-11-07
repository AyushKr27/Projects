import express from "express";
import { protect, admin } from "../middleware/auth.js";
import {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getUserOrders,
  getAllOrders
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/myorders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, updateOrderStatus); // seller/admin only logic inside
router.get("/", protect, admin, getAllOrders);

export default router;
