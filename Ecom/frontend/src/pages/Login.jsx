import { useState } from "react";
import axiosInstance from "../api/axios"; // ✅ consistent import
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSeller, setIsSeller] = useState(false); // ✅ toggle for seller
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isSeller ? "/api/seller/login" : "/api/auth/login";
      const res = await axiosInstance.post(endpoint, { email, password });

      // Save token and user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert(`${isSeller ? "Seller" : "User"} logged in successfully!`);
      navigate(isSeller ? "/seller/dashboard" : "/");
    } catch (err) {
      console.error(err);
      alert("❌ Login failed — check credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {isSeller ? "Seller Login" : "User Login"}
        </h2>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            {isSeller ? "Login as Seller" : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">
            Don’t have an account?{" "}
            <button
              onClick={() => navigate(isSeller ? "/seller/register" : "/register")}
              className="text-indigo-600 hover:underline"
            >
              Register here
            </button>
          </p>

          <p>
            {isSeller ? (
              <button
                onClick={() => setIsSeller(false)}
                className="text-sm text-gray-600 hover:text-indigo-600"
              >
                Login as User
              </button>
            ) : (
              <button
                onClick={() => setIsSeller(true)}
                className="text-sm text-gray-600 hover:text-indigo-600"
              >
                Login as Seller
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
