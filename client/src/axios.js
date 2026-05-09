import axios from "axios";

const api = axios.create({
  baseURL: "https://mern-ecommerce-il1t.onrender.com",
  withCredentials: true   // 🔥 GLOBAL FIX
});

export default api;