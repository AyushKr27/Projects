import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const SellerRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/seller/register", formData);
      localStorage.setItem("sellerToken", res.data.token);
      navigate("/seller/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Seller Registration</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            className="border w-full p-2 mb-3 rounded"
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border w-full p-2 mb-3 rounded"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border w-full p-2 mb-3 rounded"
            onChange={handleChange}
            required
          />
          <input
            name="shopName"
            placeholder="Shop Name"
            className="border w-full p-2 mb-3 rounded"
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
          >
            Register
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/seller/login" className="text-blue-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;
