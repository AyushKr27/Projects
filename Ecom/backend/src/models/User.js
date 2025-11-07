import mongoose from "mongoose";
import bcrypt from "bcrypt";

const addressSchema = new mongoose.Schema({
  label: String,
  line1: String,
  city: String,
  state: String,
  postalCode: String,
  country: String
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "seller", "admin"], default: "user" },
  isVerified: { type: Boolean, default: false },
  addresses: [addressSchema],
  createdAt: { type: Date, default: Date.now }
});

// hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
