import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";

export const fetchTasks = createAsyncThunk("tasks/fetch", async () => {
  const res = await api.get("/api/tasks");
  return res.data;
});

export const createTask = createAsyncThunk("tasks/create", async (payload) => {
  const res = await api.post("/api/tasks", payload);
  return res.data;
});

export const updateTask = createAsyncThunk("tasks/update", async ({ id, data }) => {
  const res = await api.put(`/api/tasks/${id}`, data);
  return res.data;
});

export const deleteTask = createAsyncThunk("tasks/delete", async (id) => {
  await api.delete(`/api/tasks/${id}`);
  return id;
});

const slice = createSlice({
  name: "tasks",
  initialState: { items: [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.items = state.items.map(t => t._id === action.payload._id ? action.payload : t);
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t._id !== action.payload);
      });
  }
});

export default slice.reducer;
