import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Header() {
  const cart = useSelector((s) => s.cart.items);
  const user = useSelector((s) => s.user.user);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-indigo-600">Ecom</Link>

        <div className="flex items-center gap-4">
          <Link to="/products" className="hover:underline">Products</Link>
          <Link to="/cart" className="relative">
            Cart
            <span className="ml-1 inline-block bg-indigo-600 text-white text-xs rounded-full px-2">{cart.length}</span>
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">{user.name}</span>
              <button onClick={logout} className="text-sm text-red-500">Logout</button>
            </div>
          ) : (
            <div>
              <Link to="/login" className="text-sm text-indigo-600">Login</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
