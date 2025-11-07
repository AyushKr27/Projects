import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const SellerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/seller/login", {
        email,
        password,
      });
      localStorage.setItem("sellerToken", res.data.token);
      navigate("/seller/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Seller Login</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="border w-full p-2 mb-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border w-full p-2 mb-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/seller/register" className="text-blue-600 font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;
