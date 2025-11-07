import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payment.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import sellerAuthRoutes from "./routes/sellerAuth.js";
import sellerProductRoutes from "./routes/sellerProducts.js";
dotenv.config();
const app = express();
const server = http.createServer(app);

// ✅ Socket.IO Setup
export const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("join_order_room", (orderId) => {
    socket.join(`order_${orderId}`);
  });

  socket.on("leave_order_room", (orderId) => {
    socket.leave(`order_${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("❎ Socket disconnected:", socket.id);
  });
});

// ✅ Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 1000 * 60, // 1 minute
    max: 200, // limit each IP to 200 requests per minute
  })
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/seller", sellerAuthRoutes);
app.use("/api/seller/products", sellerProductRoutes);



// ✅ Basic route
app.get("/", (req, res) => {
  res.json({ ok: true, msg: "E-commerce backend running 🚀" });
});

// ✅ Error handlers
app.use(notFound);
app.use(errorHandler);

// ✅ Database + Server Start
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  });
