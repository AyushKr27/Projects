import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      // optional: store user object
      localStorage.setItem("user", JSON.stringify({ name: res.data.name, email: res.data.email }));
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border px-3 py-2 rounded" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border px-3 py-2 rounded" />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Login</button>
      </form>
    </div>
  );
}
