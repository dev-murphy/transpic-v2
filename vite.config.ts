import { defineConfig } from "vite";
import Tailwindcss from "@tailwindcss/vite";
import Vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [Vue(), Tailwindcss()],
});
