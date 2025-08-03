import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  IconButton,
  Button,
  Box,
  Paper,
  Snackbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const mergeCartItems = (items) => {
    const merged = {};
    items.forEach((item) => {
      if (merged[item.id]) {
        merged[item.id].quantity += item.quantity || 1;
      } else {
        merged[item.id] = { ...item, quantity: item.quantity || 1 };
      }
    });
    return Object.values(merged);
  };

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart")) || [];
    const mergedCart = mergeCartItems(cartData);
    setCart(mergedCart);
    setLoading(false);
  }, []);

  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleQuantityChange = (id, delta) => {
    const updatedCart = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    saveCart(updatedCart);
  };

  const handleRemove = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    saveCart(updatedCart);
  };

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const oldOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const newOrder = {
      id: Date.now(),
      items: cart,
      date: new Date().toISOString(),
    };
    localStorage.setItem("orders", JSON.stringify([...oldOrders, newOrder]));
    localStorage.removeItem("cart");
    setCart([]);
    setSnackbarOpen(true);
    setTimeout(() => {
      setSnackbarOpen(false);
      navigate("/items");
    }, 1500);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        🛒 Your Cart
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : cart.length === 0 ? (
        <Typography>No items in your cart.</Typography>
      ) : (
        <>
          <List>
            {cart.map((item) => (
              <React.Fragment key={item.id}>
                <Paper elevation={3} sx={{ mb: 2, p: 2 }}>
                  <ListItem alignItems="center">
                    <ListItemAvatar>
                      <Avatar
                        variant="square"
                        src={item.image || "https://via.placeholder.com/50"}
                        alt={item.name || `Item ${item.id}`}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                    </ListItemAvatar>

                    <ListItemText
                      primary={item.name}
                      secondary={`Price: ₹${item.price}`}
                    />

                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton onClick={() => handleQuantityChange(item.id, -1)}>
                        <RemoveIcon />
                      </IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton onClick={() => handleQuantityChange(item.id, 1)}>
                        <AddIcon />
                      </IconButton>
                    </Box>

                    <IconButton
                      edge="end"
                      onClick={() => handleRemove(item.id)}
                      color="error"
                      sx={{ ml: 2 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                </Paper>
              </React.Fragment>
            ))}
          </List>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Total: ₹{totalPrice}</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1400}
        message="Order successful!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setSnackbarOpen(false)}
      />
    </Container>
  );
};

export default Cart;
