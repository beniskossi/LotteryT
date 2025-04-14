import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// Nous pouvons garder le plugin de thème si vous l'utilisez
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";

export default defineConfig({
  plugins: [
    react(),
    themePlugin(),
    // Les plugins spécifiques à Replit ont été retirés car ils ne sont pas nécessaires pour GitHub
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  // Ajout de la configuration pour le déploiement sur GitHub Pages
  base: "/LotteryT/",
});
