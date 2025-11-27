import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";

const token = localStorage.getItem("token");

export const registerUser = createAsyncThunk("auth/register", async (data, thunkAPI) => {
  const res = await api.post("/api/auth/register", data);
  return res.data;
});

export const loginUser = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  const res = await api.post("/api/auth/login", data);
  const tok = res.data.token;
  if (tok) {
    localStorage.setItem("token", tok);
  }
  return tok;
});

const slice = createSlice({
  name: "auth",
  initialState: { token: token || null, status: "idle" },
  reducers: {
    logout(state) {
      state.token = null;
      localStorage.removeItem("token");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload;
      });
  }
});

export const { logout } = slice.actions;
export default slice.reducer;
