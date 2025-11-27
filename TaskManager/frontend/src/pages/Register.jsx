import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { registerUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, formState:{ errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err) {
      const msg = err?.message || "Registration failed";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-purple-200 via-indigo-200 to-blue-200
      dark:from-slate-800 dark:via-slate-900 dark:to-slate-900">

      <Toaster position="top-right" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 
          bg-gradient-to-br from-purple-400 to-pink-300 
          opacity-20 dark:opacity-10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-80 h-80 
          bg-gradient-to-br from-blue-200 to-indigo-300 
          opacity-20 dark:opacity-10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/30 dark:bg-slate-800/60 backdrop-blur-lg 
          shadow-2xl rounded-2xl border border-white/40 dark:border-slate-700 
          p-8 animate-fadeIn">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center 
              bg-gradient-to-br from-purple-600 to-indigo-600 
              text-white font-bold text-lg shadow">
              TM
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Create Account
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Join us and start managing tasks effortlessly
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            <div>
              <label 
                htmlFor="username" 
                className="text-gray-700 dark:text-gray-200 font-medium block mb-1"
              >
                Username
              </label>

              <div className="flex items-center gap-3 border rounded-lg px-3 py-2
                bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm
                focus-within:ring-2 focus-within:ring-purple-400 dark:focus-within:ring-purple-500">
                
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 10a4 4 0 100-8 4 4 0 000 8z"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M2 18a8 8 0 1116 0H2z"/>
                </svg>

                <input
                  id="username"
                  {...register("username")}
                  placeholder="Choose a username"
                  className="w-full bg-transparent outline-none 
                    text-gray-700 dark:text-gray-100 
                    placeholder-gray-400 dark:placeholder-gray-400"
                  autoComplete="username"
                  aria-invalid={!!errors.username}
                />
              </div>

              <p className="text-rose-500 text-sm mt-1">{errors.username?.message}</p>
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="text-gray-700 dark:text-gray-200 font-medium block mb-1"
              >
                Password
              </label>

              <div className="relative flex items-center gap-3 border rounded-lg px-3 py-2
                bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm
                focus-within:ring-2 focus-within:ring-purple-400 dark:focus-within:ring-purple-500">
                
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" clipRule="evenodd" d="M5 8a5 5 0 0110 0v2h1a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6a1 1 0 011-1h1V8zm7 2V8a3 3 0 00-6 0v2h6z"/>
                </svg>

                <input
                  id="password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="w-full bg-transparent outline-none 
                    text-gray-700 dark:text-gray-100 
                    placeholder-gray-400 dark:placeholder-gray-400 pr-10"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.3 3.7L1 5l3.8 3.8A9.9 9.9 0 013 11c3 4 7 6 9 6 1.5 0 3-.5 4.4-1.4l2.1 2.1 1.3-1.3L3.6 2.4 2.3 3.7zM12 5c-1.5 0-3 .5-4.4 1.4l1.5 1.5C10.3 7 11.1 7 12 7c3 0 5.5 2 7 4-1.1 1.5-3 3-7 3-1 0-2-.2-3-.6L7.2 9.7 12 5z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 5c-3 0-5.7 1.7-7.7 4.4 2 2.7 4.7 4.6 7.7 4.6 3 0 5.7-1.9 7.7-4.6C17.7 6.7 15 5 12 5zM12 9a3 3 0 100 6 3 3 0 000-6z"/>
                    </svg>
                  )}
                </button>
              </div>

              <p className="text-rose-500 text-sm mt-1">{errors.password?.message}</p>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 
                text-white font-semibold py-2.5 rounded-lg shadow-md 
                transition-all disabled:opacity-60"
            >
              {isSubmitting ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-700 dark:text-gray-300 mt-4">
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-purple-700 dark:text-purple-300 hover:underline font-semibold"
            >
              Login
            </button>
          </p>

        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          Secure & Easy Task Management
        </div>
      </div>
    </div>
  );
}
