import { defineConfig } from "vite";

// Cloudflare Pages / static hosting 想定。ルート配信なので base は "/"。
export default defineConfig({
  base: "/",
  build: {
    target: "es2022",
  },
});
