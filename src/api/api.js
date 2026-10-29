import axios from "axios";

const backendUrl = (
  import.meta.env.VITE_BACK_END_URL || "http://localhost:8080"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? "/api"
    : `${backendUrl}/api`,
  withCredentials: true,
});

export default api;