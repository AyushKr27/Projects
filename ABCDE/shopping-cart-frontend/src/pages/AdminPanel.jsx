import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  Box,
  IconButton,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      toast.error("Unauthorized");
      navigate("/login");
    } else {
      fetchItems();
    }
  }, []);

  const fetchItems = () => {
    api
      .get("/items")
      .then((res) => setItems(res.data))
      .catch(() => toast.error("Failed to load items"));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.description || !form.price || !form.image) {
      toast.warning("Please fill all fields");
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
    };

    if (editingId) {
      api
        .put(`/admin/items/${editingId}`, payload)
        .then(() => {
          toast.success("Item updated");
          setForm({ name: "", description: "", price: "", image: "" });
          setEditingId(null);
          fetchItems();
        })
        .catch(() => toast.error("Update failed"));
    } else {
      api
        .post("/admin/items", payload)
        .then(() => {
          toast.success("Item added");
          setForm({ name: "", description: "", price: "", image: "" });
          fetchItems();
        })
        .catch(() => toast.error("Failed to add item"));
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
    });
    setEditingId(item.id || item._id);
  };

  const handleDelete = (id) => {
    api
      .delete(`/admin/items/${id}`)
      .then(() => {
        toast.success("Item deleted");
        fetchItems();
      })
      .catch(() => toast.error("Delete failed"));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleGoHome = () => {
    navigate("/items");
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">Admin Dashboard</Typography>
          <Box>
            <IconButton color="inherit" onClick={handleGoHome}>
              <HomeIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          {/* Form Section */}
          <Grid item xs={12} md={5}>
            <Typography variant="h5" gutterBottom>
              {editingId ? "Edit Item" : "Add New Item"}
            </Typography>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Price"
              name="price"
              value={form.price}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Image URL"
              name="image"
              value={form.image}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              fullWidth
              startIcon={editingId ? <SaveIcon /> : null}
            >
              {editingId ? "Update Item" : "Add Item"}
            </Button>
          </Grid>

          {/* Items List Section */}
          <Grid item xs={12} md={7}>
            <Typography variant="h5" gutterBottom>
              Current Items
            </Typography>
            <Grid container spacing={2}>
              {items.map((item) => {
                const imgSrc = item.image?.startsWith("http")
                  ? item.image
                  : `http://localhost:8080/${item.image}`;

                return (
                  <Grid item xs={12} sm={6} key={item.id || item._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ₹{item.price}
                        </Typography>
                        <Box
                          component="img"
                          src={imgSrc}
                          alt={item.name}
                          sx={{
                            width: "100%",
                            height: 150,
                            objectFit: "cover",
                            borderRadius: 1,
                            mt: 1,
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/300x150?text=Image+Not+Found";
                          }}
                        />
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(item.id || item._id)}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default AdminPanel;
