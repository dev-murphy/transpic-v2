import * as path from "path";

import { defineConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Tailwindcss from "@tailwindcss/vite";
import VueDevtools from "vite-plugin-vue-devtools";
import Vue from "@vitejs/plugin-vue";
import WebfontDownload from "vite-plugin-webfont-dl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    AutoImport({
      include: [/\.vue$/, /\.vue\?vue/],
      imports: ["vue", "@vueuse/core"],
      dts: "src/auto-imports.d.ts",
    }),
    Components({
      extensions: ["vue"],
      include: [/\.vue$/, /\.vue\?vue/],
      dts: "src/components.d.ts",
    }),
    Vue(),
    VueDevtools(),
    Tailwindcss(),
    WebfontDownload(),
  ],
  resolve: {
    alias: {
    "@/": `${path.resolve(__dirname, "src")}/`,
    },
  },
});
