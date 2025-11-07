import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { io } from "../index.js";

export const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, subtotal, tax, shipping, total } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ message: "Cart is empty" });

  // attach seller info and price snapshot
  const itemsSnapshot = await Promise.all(
    items.map(async (it) => {
      const p = await Product.findById(it.product);
      return {
        product: p._id,
        name: p.name,
        image: p.images?.[0] || "",
        seller: p.seller,
        qty: it.qty,
        price: p.price
      };
    })
  );

  const order = new Order({
    user: req.user._id,
    items: itemsSnapshot,
    shippingAddress,
    paymentMethod,
    subtotal, tax, shipping, total
  });
  await order.save();

  // broadcast to user's order room
  io.to(`order_${order._id}`).emit("order_update", { status: order.status, orderId: order._id });

  res.status(201).json(order);
};

export const getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  // only admin or the seller of items can update to certain statuses — simple check:
  // admin can update anything; sellers can only update if they own items in order
  const isAdmin = req.user.role === "admin";
  const sellerOwns = order.items.some((it) => it.seller.toString() === req.user._id.toString());

  if (!isAdmin && !sellerOwns) return res.status(403).json({ message: "Not authorized to update this order" });

  order.status = status;
  order.updatedAt = Date.now();
  await order.save();

  // notify via socket.io
  io.to(`order_${order._id}`).emit("order_update", { status: order.status, orderId: order._id });

  res.json(order);
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");
  res.json(orders);
};
