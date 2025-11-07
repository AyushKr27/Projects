// backend/src/routes/sellerProducts.js
import express from "express";
import Product from "../models/Product.js";
import { protect, seller } from "../middleware/auth.js";

const router = express.Router();

// ✅ Add product
router.post("/add", protect, seller, async (req, res) => {
  try {
    const { name, description, price, category, stock, images } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      images,
      seller: req.seller?._id || req.user._id,
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error("❌ Error adding product:", err.message);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// ✅ Get all seller products
router.get("/my-products", protect, seller, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.seller?._id || req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch seller products" });
  }
});

// ✅ Get a single product by ID
router.get("/:id", protect, seller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.seller.toString() !== (req.seller?._id || req.user._id).toString())
      return res.status(403).json({ message: "Unauthorized" });

    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// ✅ Update product
router.put("/:id", protect, seller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== (req.seller?._id || req.user._id).toString())
      return res.status(403).json({ message: "Unauthorized" });

    Object.assign(product, req.body);
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// ✅ Delete product
router.delete("/:id", protect, seller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== (req.seller?._id || req.user._id).toString())
      return res.status(403).json({ message: "Unauthorized" });

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
