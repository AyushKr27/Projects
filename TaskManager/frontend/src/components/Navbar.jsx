import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import ThemeToggle from "./ThemeToggle";

export default function NavBar() {
  const token = useSelector((s) => s.auth.token);
  const dispatch = useDispatch();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50">
      <nav className="backdrop-blur-sm bg-white/60 dark:bg-slate-900/60 border-b border-white/30 dark:border-slate-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 no-underline">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center 
                  bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold"
                >
                  TM
                </div>
                <div className="hidden sm:block leading-tight">
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Task Manager
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">MERN</div>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">

              <ThemeToggle />

              <Link
                to="/tasks"
                className={
                  "px-3 py-2 rounded-md text-sm font-medium " +
                  (isActive("/tasks")
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-slate-800")
                }
              >
                Tasks
              </Link>

              {!token ? (
                <>
                  <Link
                    to="/login"
                    className={
                      "px-3 py-2 rounded-md text-sm font-medium " +
                      (isActive("/login")
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-slate-800")
                    }
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className={
                      "px-3 py-2 rounded-md text-sm font-medium " +
                      (isActive("/register")
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-slate-800")
                    }
                  >
                    Register
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => dispatch(logout())}
                  className="px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-medium shadow-sm"
                >
                  Logout
                </button>
              )}

            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
