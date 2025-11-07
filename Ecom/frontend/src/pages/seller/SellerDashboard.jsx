import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalSales: 0,
    topCategories: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("sellerToken");
    if (!token) {
      navigate("/seller/login");
      return;
    }

    // 🧮 Fetch seller stats (dummy simulation or from backend later)
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/seller/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("⚠️ Failed to fetch stats:", err);
        // fallback for now
        setStats({
          totalProducts: 18,
          totalStock: 122,
          totalSales: 95,
          topCategories: [
            { name: "Clothing", value: 45 },
            { name: "Electronics", value: 30 },
            { name: "Home Decor", value: 25 },
          ],
        });
      }
    };

    fetchStats();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("sellerToken");
    navigate("/seller/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-3">
          <h1 className="text-3xl font-bold text-indigo-700">🏪 Seller Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            to="/seller/add-product"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition"
          >
            ➕ Add New Product
          </Link>
          <Link
            to="/seller/my-products"
            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg shadow-md transition"
          >
            📦 My Products
          </Link>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-5 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold">Total Products</h2>
            <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold">Total Stock</h2>
            <p className="text-3xl font-bold mt-2">{stats.totalStock}</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-5 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold">Total Sales</h2>
            <p className="text-3xl font-bold mt-2">{stats.totalSales}</p>
          </div>
        </div>

        {/* Top Categories Chart */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Top Selling Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
