import { createSlice } from "@reduxjs/toolkit";

const user = JSON.parse(localStorage.getItem("user") || "null");

const userSlice = createSlice({
  name: "user",
  initialState: { user },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    clearUser(state) {
      state.user = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
