import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

function Header({ onViewCart, onCheckout, onViewOrders, onLogout }) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          🛒 MyShop
        </Typography>
        <Box>
          <Button onClick={() => navigate("/admin")}>Admin</Button>

          <Button color="inherit" onClick={onViewCart}>
            Cart
          </Button>
          <Button color="inherit" onClick={onCheckout}>
            Checkout
          </Button>
          <Button color="inherit" onClick={onViewOrders}>
            Orders
          </Button>
          <Button color="inherit" onClick={onLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
