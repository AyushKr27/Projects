import mongoose from "mongoose";

// ✅ Review Subschema
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

// ✅ Product Schema
const productSchema = new mongoose.Schema({
  // 🧑‍💼 Seller info
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller", // ✅ updated from "User" to "Seller"
    required: true,
  },

  // 🛍️ Product details
  name: { type: String, required: true, index: true },
  slug: { type: String, index: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, index: true },
  tags: [String],
  images: [String],

  // 📦 Stock & Metrics
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: [reviewSchema],
  reviewsCount: { type: Number, default: 0 },

  // 🕒 Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ✅ Pre-save slug generation (optional)
productSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

export default mongoose.model("Product", productSchema);
