import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Get repo name from package.json or default to "/"
import pkg from "./package.json";

export default defineConfig(({ mode }) => {
  const repoName = pkg.name || ""; // usually same as your GitHub repo
  return {
    // This makes base path always match repo name automatically
    base: `/${repoName}/`,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
