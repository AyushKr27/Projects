import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import api from "../api";

const Register = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    const { username, password } = form;

    if (!username || !password) {
      toast.warn("Please fill in all fields");
      return;
    }

    try {
      const res = await api.post("/users", { username, password });
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Registration failed. Try a different username.");
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Register
        </Typography>
        <TextField
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Box mt={2}>
          <Button variant="contained" color="primary" fullWidth onClick={handleRegister}>
            Register
          </Button>
        </Box>
        <Button fullWidth sx={{ mt: 1 }} onClick={() => navigate("/login")}>
          Already have an account? Login
        </Button>
      </Paper>
    </Container>
  );
};

export default Register;
