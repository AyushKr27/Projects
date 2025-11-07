import { Link, useLocation } from "react-router-dom";

const SellerSidebar = () => {
  const location = useLocation();
  const active = (path) => (location.pathname === path ? "bg-indigo-600 text-white" : "text-gray-700");

  return (
    <div className="w-60 bg-gray-100 min-h-screen p-5 border-r">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600">Seller Panel</h2>
      <nav className="flex flex-col gap-3">
        <Link to="/seller/dashboard" className={`p-2 rounded ${active("/seller/dashboard")}`}>Dashboard</Link>
        <Link to="/seller/add-product" className={`p-2 rounded ${active("/seller/add-product")}`}>Add Product</Link>
        <Link to="/seller/my-products" className={`p-2 rounded ${active("/seller/my-products")}`}>My Products</Link>
      </nav>
    </div>
  );
};

export default SellerSidebar;
