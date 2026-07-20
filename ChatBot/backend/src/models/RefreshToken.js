// src/models/RefreshToken.js
import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, index: true, unique: true },
  userId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

// TTL index: Mongo will delete documents once `expiresAt` is in the past.
// Note: Mongo's TTL monitor runs approximately once a minute.
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("RefreshToken", RefreshTokenSchema);