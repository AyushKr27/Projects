import React, { useState, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, IconButton } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ItemList from "./pages/ItemList";
import AdminPanel from "./pages/AdminPanel";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cart from "./pages/Cart";

const PrivateRoute = ({ children }) => {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
};

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <IconButton
        onClick={toggleTheme}
        sx={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}
        color="inherit"
      >
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/items"
          element={
            <PrivateRoute>
              <ItemList />
            </PrivateRoute>
          }
        />
        <Route path="/cart" element={<Cart/>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>

      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;
