import Product from "../models/Product.js";

// GET /api/products?search=&category=&min=&max=&sort=&page=
export const getProducts = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.limit) || 12;
  const { search, category, min, max, sort } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };
  if (category) filter.category = category;
  if (min) filter.price = { ...(filter.price || {}), $gte: Number(min) };
  if (max) filter.price = { ...(filter.price || {}), $lte: Number(max) };

  let query = Product.find(filter);

  if (sort === "price_asc") query = query.sort({ price: 1 });
  else if (sort === "price_desc") query = query.sort({ price: -1 });
  else if (sort === "latest") query = query.sort({ createdAt: -1 });

  const total = await Product.countDocuments(filter);
  const products = await query.skip((page - 1) * pageSize).limit(pageSize);
  res.json({ products, total, page, pages: Math.ceil(total / pageSize) });
};

export const getProductById = async (req, res) => {
  const p = await Product.findById(req.params.id).populate("seller", "name email");
  if (!p) return res.status(404).json({ message: "Product not found" });
  res.json(p);
};

export const createProduct = async (req, res) => {
  const { name, price, description, category, tags, stock, images } = req.body;
  const product = new Product({
    seller: req.user._id,
    name, price, description, category, tags, stock, images
  });
  await product.save();
  res.status(201).json(product);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  // only seller or admin can update
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin")
    return res.status(403).json({ message: "Not allowed" });

  Object.assign(product, req.body);
  await product.save();
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  await product.remove();
  res.json({ message: "Product removed" });
};

export const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  const already = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (already) return res.status(400).json({ message: "You already reviewed the product" });
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  product.reviews.push(review);
  product.reviewsCount = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ message: "Review added" });
};
