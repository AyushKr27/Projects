import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("sellerToken");
      const res = await axios.get("http://localhost:5000/api/seller/products/my-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products);
    } catch (err) {
      setMessage("❌ Failed to fetch products");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("sellerToken");
      await axios.delete(`http://localhost:5000/api/seller/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Product deleted successfully");
      fetchProducts();
    } catch (err) {
      setMessage("❌ Failed to delete product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Products</h2>
        <Link
          to="/seller/add-product"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Add Product
        </Link>
      </div>

      {message && <p className="text-center text-sm text-green-600 mb-4">{message}</p>}

      {products.length === 0 ? (
        <p className="text-gray-600 text-center">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p._id} className="bg-white p-4 rounded shadow relative">
              <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
              <p className="text-gray-600 mb-1">₹{p.price}</p>
              <p className="text-sm text-gray-500 mb-2">{p.category}</p>
              <p className="text-sm text-gray-500">Stock: {p.stock}</p>

              <div className="flex justify-between mt-4">
                <Link
                  to={`/seller/edit-product/${p._id}`}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  ✏️ Edit
                </Link>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
