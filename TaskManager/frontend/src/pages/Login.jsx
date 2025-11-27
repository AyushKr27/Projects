import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState:{errors, isSubmitting} } = useForm({
    resolver: zodResolver(schema)
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success("Logged in");
      navigate("/tasks");
    } catch (err) {

      const msg = err?.message || (err?.data && err.data.message) || "Login failed";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900">
      
      <Toaster position="top-right" />

      <div className="w-full max-w-md bg-white/30 dark:bg-slate-800/60 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-white/40 dark:border-slate-700 animate-fadeIn">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-label="login form" noValidate>
          
          <div>
            <label htmlFor="username" className="text-gray-700 dark:text-gray-200 font-medium block mb-1">
              Username
            </label>
            <div className="flex items-center gap-3 border rounded-lg px-3 py-2 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm focus-within:ring-2 focus-within:ring-indigo-400 dark:focus-within:ring-indigo-500">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 10a4 4 0 100-8 4 4 0 000 8z"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M2 18a8 8 0 1116 0H2z"/>
              </svg>
              <input
                id="username"
                {...register("username")}
                placeholder="Enter your username"
                className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                autoComplete="username"
                autoFocus
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? "username-error" : undefined}
              />
            </div>
            <p id="username-error" className="text-rose-500 text-sm mt-1" role="alert">{errors.username?.message}</p>
          </div>

          <div>
            <label htmlFor="password" className="text-gray-700 dark:text-gray-200 font-medium block mb-1">
              Password
            </label>
            <div className="relative flex items-center gap-3 border rounded-lg px-3 py-2 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm focus-within:ring-2 focus-within:ring-indigo-400 dark:focus-within:ring-indigo-500">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M5 8a5 5 0 0110 0v2h1a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6a1 1 0 011-1h1V8zm7 2V8a3 3 0 00-6 0v2h6z"/>
              </svg>

              <input
                id="password"
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 pr-10"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.3 3.7L1 5l3.8 3.8A9.9 9.9 0 013 11c3 4 7 6 9 6 1.5 0 3-.5 4.4-1.4l2.1 2.1 1.3-1.3L3.6 2.4 2.3 3.7zM12 5c-1.5 0-3 .5-4.4 1.4l1.5 1.5C10.3 7 11.1 7 12 7c3 0 5.5 2 7 4-1.1 1.5-3 3-7 3-1 0-2-.2-3-.6L7.2 9.7 12 5z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c-3 0-5.7 1.7-7.7 4.4 2 2.7 4.7 4.6 7.7 4.6 3 0 5.7-1.9 7.7-4.6C17.7 6.7 15 5 12 5zM12 9a3 3 0 100 6 3 3 0 000-6z"/></svg>
                )}
              </button>
            </div>
            <p id="password-error" className="text-rose-500 text-sm mt-1" role="alert">{errors.password?.message}</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all disabled:opacity-60"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-700 dark:text-gray-300 mt-4">
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")} className="text-indigo-700 dark:text-indigo-300 hover:underline font-semibold">
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
