import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

dotenv.config();

const seed = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    const admin = await User.create({ name: "Admin", email: "admin@ecom.com", password: "password", role: "admin", isVerified: true });
    const seller = await User.create({ name: "Seller One", email: "seller@ecom.com", password: "password", role: "seller", isVerified: true });
    const user = await User.create({ name: "Buyer", email: "buyer@ecom.com", password: "password", role: "user", isVerified: true });

    const products = await Product.create([
      {
        seller: seller._id,
        name: "Blue T-Shirt",
        description: "Comfortable cotton tee",
        price: 19.99,
        category: "Apparel",
        stock: 100,
        images: []
      },
      {
        seller: seller._id,
        name: "Wireless Headphones",
        description: "Noise cancelling",
        price: 99.99,
        category: "Electronics",
        stock: 50,
        images: []
      }
    ]);

    const order = await Order.create({
      user: user._id,
      items: [
        { product: products[0]._id, name: products[0].name, image: "", seller: seller._id, qty: 2, price: products[0].price }
      ],
      shippingAddress: { line1: "123 Street", city: "City", state: "ST", postalCode: "000000", country: "Country" },
      paymentMethod: "stripe",
      subtotal: 39.98,
      tax: 3.2,
      shipping: 5,
      total: 48.18
    });

    console.log("✅ Seed completed");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
