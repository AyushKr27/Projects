import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";

export const fetchProducts = createAsyncThunk("products/fetch", async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await axios.get(`/api/products?${q}`);
  return res.data;
});

const productsSlice = createSlice({
  name: "products",
  initialState: { products: [], total: 0, page: 1, pages: 1, status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (s) => { s.status = "loading"; });
    builder.addCase(fetchProducts.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.products = a.payload.products;
      s.total = a.payload.total;
      s.page = a.payload.page;
      s.pages = a.payload.pages;
    });
    builder.addCase(fetchProducts.rejected, (s) => { s.status = "failed"; });
  }
});

export default productsSlice.reducer;
