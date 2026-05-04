import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const repoBasePath = "/cxg-sansu-jellies/";

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH ?? (mode === "production" ? repoBasePath : "/"),
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["jelly-icon.svg"],
      manifest: {
        name: "ぷるぷるゼリーさんすう",
        short_name: "ゼリーさんすう",
        description: "ゼリーを動かして足し算を学ぶ幼児向け算数ゲーム",
        theme_color: "#fff8e8",
        background_color: "#fff8e8",
        display: "standalone",
        orientation: "portrait",
        scope: process.env.VITE_BASE_PATH ?? (mode === "production" ? repoBasePath : "/"),
        start_url: ".",
        icons: [
          {
            src: "jelly-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,webp,png,mp3,webm}"]
      }
    })
  ]
}));
