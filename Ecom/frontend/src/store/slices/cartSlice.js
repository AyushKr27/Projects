import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: JSON.parse(localStorage.getItem("cart_items") || "[]")
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action) {
      const it = action.payload;
      const exists = state.items.find(i => i.productId === it.productId);
      if (exists) exists.qty += it.qty;
      else state.items.push(it);
      localStorage.setItem("cart_items", JSON.stringify(state.items));
    },
    removeItem(state, action) {
      state.items = state.items.filter(i => i.productId !== action.payload);
      localStorage.setItem("cart_items", JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      localStorage.setItem("cart_items", JSON.stringify([]));
    }
  }
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
