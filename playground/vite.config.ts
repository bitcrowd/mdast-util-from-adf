import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/mdast-util-from-adf",
  plugins: [react(), tailwindcss()],
  define: {
    "process.env.CI": "undefined",
  },
  css: {
    // Atlaskit contains some invalid CSS…
    lightningcss: { errorRecovery: true },
  },
});
