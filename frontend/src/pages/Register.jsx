import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Register failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full border px-3 py-2 rounded" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border px-3 py-2 rounded" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border px-3 py-2 rounded" />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">Register</button>
      </form>
    </div>
  );
}
