import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shopName: { type: String, required: true },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

// Hash password
sellerSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
sellerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT token
sellerSchema.methods.getSignedToken = function() {
  return jwt.sign(
    { id: this._id, role: "seller" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

export default mongoose.model("Seller", sellerSchema);
