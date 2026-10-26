import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_")
  const backendTarget = (env.VITE_BACK_END_URL || "http://localhost:8080").replace(/\/+$/, "")

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
