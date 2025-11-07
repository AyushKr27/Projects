import { useSelector, useDispatch } from "react-redux";
import { removeItem } from "../store/slices/cartSlice";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { items } = useSelector((s) => s.cart);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        {items.length === 0 ? (
          <div>Your cart is empty. <Link to="/products" className="text-indigo-600">Shop now</Link></div>
        ) : items.map((it) => (
          <div key={it.productId} className="bg-white p-4 rounded shadow flex items-center gap-4">
            <img src={it.image || "https://via.placeholder.com/80"} className="w-20 h-20 object-cover" />
            <div className="flex-1">
              <div className="font-semibold">{it.name}</div>
              <div className="text-sm">Qty: {it.qty}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">₹{(it.price * it.qty).toFixed(2)}</div>
              <button className="text-red-500 text-sm mt-2" onClick={() => dispatch(removeItem(it.productId))}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <aside className="bg-white p-4 rounded shadow">
        <div className="font-semibold">Subtotal: ₹{subtotal.toFixed(2)}</div>
        <button onClick={() => navigate("/checkout")} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded">Proceed to Checkout</button>
      </aside>
    </div>
  );
}
