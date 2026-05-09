import axios from "axios";

const api = axios.create({
  baseURL: "https://mern-ecommerce-2-tcjx.onrender.com",
  withCredentials: true,
});

export default api;