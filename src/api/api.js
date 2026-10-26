import axios from "axios";

const backendUrl = (import.meta.env.VITE_BACK_END_URL || "http://localhost:8080")
    .replace(/\/+$/, "");

const api = axios.create({
    // In local Vite development, route API requests through the dev-server proxy.
    // This keeps the JWT cookie first-party in the browser.
    baseURL: import.meta.env.DEV ? "/api" : backendUrl + "/api",
    withCredentials: true,
});

export default api;
