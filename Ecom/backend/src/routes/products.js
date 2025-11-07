import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addReview
} from "../controllers/productController.js";
import { protect, seller, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, seller, createProduct);
router.put("/:id", protect, seller, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/reviews", protect, addReview);

export default router;
