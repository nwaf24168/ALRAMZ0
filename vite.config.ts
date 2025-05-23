import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "0.0.0.0",
    port: 5000,
    cors: true,
    strictPort: true,
    hmr: true,
    allowedHosts: [
      "127.0.0.1",
      "localhost",
      "32713e7c-bba7-4531-9316-e2c622eae770-00-1bn6bkbet2zhw.sisko.replit.dev",
      "e544bbb6-2261-48a6-acf0-23b74ed63964-00-26nrlxttfz9vv.pike.replit.dev",
      "a81e267e-2520-41b9-9c27-06a3af68e807-00-38tk3pjayo3x1.sisko.replit.dev",
      "37ae1873-1079-4d25-90bf-72d38cbaa07e-00-2di7woa4oncfl.sisko.replit.dev",
      "e7c7eb54-dddc-431b-8376-767baf2a0f50-00-1j9dxlvop9e26.pike.replit.dev",
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
