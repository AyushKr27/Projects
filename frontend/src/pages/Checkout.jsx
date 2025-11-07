import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Checkout() {
  const { items } = useSelector((s) => s.cart);
  const userToken = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleCreateOrderAndPay = async () => {
    // create order on backend (here we send minimal required order payload)
    try {
      const itemsPayload = items.map(i => ({ product: i.productId, qty: i.qty }));
      const orderRes = await axios.post("/api/orders", {
        items: itemsPayload,
        shippingAddress: { line1: "Demo address", city: "City", state: "State", postalCode: "000000", country: "Country" },
        paymentMethod: "stripe",
        subtotal: items.reduce((a,i) => a + i.price * i.qty, 0),
        tax: 0,
        shipping: 0,
        total: items.reduce((a,i) => a + i.price * i.qty, 0)
      });

      const order = orderRes.data;

      // create stripe session
      const res = await axios.post("/api/payment/create-checkout-session", {
        orderId: order._id,
        successUrl: `${import.meta.env.VITE_CLIENT_URL}/order-success?orderId=${order._id}`,
        cancelUrl: `${import.meta.env.VITE_CLIENT_URL}/cart`
      });

      // redirect to stripe checkout URL
      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Make sure you are logged in.");
      navigate("/login");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="bg-white p-4 rounded shadow">
        <div className="mb-4">Review items and proceed to payment</div>
        <button onClick={handleCreateOrderAndPay} className="bg-indigo-600 text-white px-4 py-2 rounded">Pay with Stripe</button>
      </div>
    </div>
  );
}
