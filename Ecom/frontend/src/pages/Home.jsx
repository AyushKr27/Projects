import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../store/slices/productSlice";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 8 }));
  }, [dispatch]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 🌟 Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover the Best Products at Unbeatable Prices 🛍️
          </h1>
          <p className="text-lg text-indigo-100 mb-6">
            Explore, shop, and enjoy a seamless online experience tailored for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/products")}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-100 transition"
            >
              Shop Now
            </button>
            <button
              onClick={() => navigate("/seller/register")}
              className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition"
            >
              Become a Seller
            </button>
          </div>
        </div>
      </section>

      {/* 🌈 Categories Section */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-8 text-gray-800">
            Shop by Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Electronics", img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=500&q=60" },
              { name: "Fashion", img: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=500&q=60" },
              { name: "Home Decor", img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=500&q=60" },
              { name: "Books", img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?auto=format&fit=crop&w=500&q=60" },
            ].map((cat) => (
              <div
                key={cat.name}
                className="relative rounded-xl overflow-hidden shadow-md hover:scale-105 transition"
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">
                    {cat.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 💎 Featured Products */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((p) => <ProductCard key={p._id} product={p} />)
            ) : (
              <p className="text-center text-gray-500 col-span-4">
                Loading products...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 💼 Become a Seller Section */}
      <section className="bg-indigo-600 text-white py-14">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Have Something to Sell? Join as a Seller Today!
          </h2>
          <p className="text-indigo-100 mb-6">
            Get access to thousands of customers, grow your business, and
            simplify your selling process with EcomStore.
          </p>
          <button
            onClick={() => navigate("/seller/register")}
            className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-100 transition"
          >
            Become a Seller
          </button>
        </div>
      </section>

      {/* ⚡ Footer */}
      <footer className="bg-gray-900 text-gray-300 text-center py-6 mt-10">
        <p>
          © {new Date().getFullYear()} <span className="text-indigo-400 font-semibold">EcomStore</span>. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
