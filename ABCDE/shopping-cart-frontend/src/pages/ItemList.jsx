import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Tooltip,
  CardMedia,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import api from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ItemList = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/items")
      .then((res) => setItems(res.data))
      .catch(() => toast.error("Failed to load items"));
  }, []);

  const addToCart = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Item added to cart");
  };

  const showCart = () => {
    navigate("/cart");
  };

  const showOrderHistory = () => {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const orderIds = orders.map((o) => o.id).join(", ");
    toast.info(orderIds || "No orders found", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleCheckout = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      toast.info("Your cart is empty.");
      return;
    }

    const oldOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const newOrder = {
      id: Date.now(),
      items: cart,
      date: new Date().toISOString(),
    };
    localStorage.setItem("orders", JSON.stringify([...oldOrders, newOrder]));

    localStorage.removeItem("cart");
    toast.success("Order successful!");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">🛒 Shopping Cart</Typography>
          <Box>
            <Tooltip title="Cart">
              <IconButton color="inherit" onClick={showCart}>
                <ShoppingCartIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Orders">
              <IconButton color="inherit" onClick={showOrderHistory}>
                <HistoryIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Checkout">
              <Button color="inherit" onClick={handleCheckout}>
                Checkout
              </Button>
            </Tooltip>

            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container>
        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "0.2s",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <CardMedia
                  component="img"
                  image={item.image || "https://via.placeholder.com/300x200?text=No+Image"}
                  alt={item.name}
                  sx={{ height: 200, objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mt: 1, mb: 2 }}>
                    ₹{item.price}
                  </Typography>
                  <Button variant="contained" fullWidth onClick={() => addToCart(item.id)}>
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default ItemList;
