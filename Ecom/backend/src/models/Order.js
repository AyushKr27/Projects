import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  image: String,
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  qty: Number,
  price: Number
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [itemSchema],
  shippingAddress: Object,
  paymentMethod: String,
  paymentResult: Object,
  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

export default mongoose.model("Order", orderSchema);
