import axios from "axios";

const api = axios.create({
  baseURL: "https://mern-ecommerce-1-jug0.onrender.com",
  withCredentials: true   // 🔥 GLOBAL FIX
});

export default api;