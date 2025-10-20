import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  modules: ["@nuxt/content", "@nuxt/fonts", "@nuxt/icon", "@nuxt/image", "@nuxtjs/color-mode", "@pinia/nuxt", "@vueuse/motion/nuxt", "nuxt-auth-utils", "nuxt-shiki"],
  imports: { dirs: ["lib/**"] },
  alias: {
    "#server": fileURLToPath(new URL("./server", import.meta.url)),
  },
  devtools: { enabled: true },
  vite: { plugins: [tailwindcss()] },
  css: ["~/assets/styles.css"],
  colorMode: {
    classSuffix: "",
    preference: "system",
    fallback: "light",
    storageKey: "nuxt-color-mode",
  },
  fonts: {
    processCSSVariables: true,
    families: [
      { name: "Inter", provider: "google" },
      { name: "Jockey One", provider: "google" },
      { name: "Siklscreen", provider: "google" },
      { name: "JetBrains Mono", provider: "google" },
    ],
  },
  icon: {
    mode: "svg",
    clientBundle: { scan: true },
  },
  shiki: {
    bundledLangs: ["bash", "html", "javascript", "json", "markdown", "typescript", "vue"],
    bundledThemes: ["monokai"],
    highlightOptions: {
      theme: "monokai",
    },
  },
})
