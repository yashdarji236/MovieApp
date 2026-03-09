import { createSlice } from "@reduxjs/toolkit";

// Load persisted auth from localStorage
const userFromStorage  = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user")) : null;
const tokenFromStorage = localStorage.getItem("token") || null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:      userFromStorage,
    token:     tokenFromStorage,
    isLoading: false,
    error:     null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user  = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("user",  JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user  = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError:   (state, action) => { state.error     = action.payload; },
    clearError: (state)         => { state.error     = null; },
  },
});

export const {
  setCredentials, updateUser,
  logout, setLoading, setError, clearError,
} = authSlice.actions;

export default authSlice.reducer;