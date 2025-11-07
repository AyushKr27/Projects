import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react"; // npm install lucide-react

export default function Header() {
  const cart = useSelector((s) => s.cart.items);
  const user = useSelector((s) => s.user.user);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-indigo-600 hover:text-indigo-700 transition"
        >
          Ecom<span className="text-indigo-400">Store</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-700 font-medium hover:text-indigo-600 transition"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-gray-700 font-medium hover:text-indigo-600 transition"
          >
            Products
          </Link>
          <Link
            to="/seller/register"
            className="text-gray-700 font-medium hover:text-indigo-600 transition"
          >
            Become a Seller
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link to="/cart" className="relative group">
            <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold rounded-full px-1.5">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Hi, {user.name}
              </span>
              <button
                onClick={logout}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 transition"
            >
              Login
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-gray-100 animate-fadeIn">
          <nav className="flex flex-col py-3 space-y-2 text-center">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-gray-700 hover:text-indigo-600"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-gray-700 hover:text-indigo-600"
            >
              Products
            </Link>
            <Link
              to="/seller/register"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-gray-700 hover:text-indigo-600"
            >
              Become a Seller
            </Link>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="block py-2 text-red-500 hover:text-red-600"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
                className="block py-2 text-indigo-600 hover:text-indigo-700"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
