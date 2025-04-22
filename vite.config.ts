import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    cors: true,
    strictPort: true,
    hmr: {
      protocol: "wss",
      host: "32713e7c-bba7-4531-9316-e2c622eae770-00-1bn6bkbet2zhw.sisko.replit.dev",
      clientPort: 443,
    },
    allowedHosts: [
      "127.0.0.1",
      "localhost",
      "32713e7c-bba7-4531-9316-e2c622eae770-00-1bn6bkbet2zhw.sisko.replit.dev",
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
