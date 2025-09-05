import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  compatibilityDate: "2025-09-05",
  modules: ["@nuxt/icon", "@nuxtjs/google-fonts", "@pinia/nuxt", "@vueuse/motion/nuxt", "nuxt-auth-utils", "nuxt-shiki"],
  imports: { dirs: ["lib/**"] },
  alias: {
    "#server": fileURLToPath(new URL("./server", import.meta.url)),
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  css: ["~/assets/styles.css"],
  googleFonts: {
    display: "swap",
    prefetch: true,
    preconnect: true,
    families: {
      "Inter": true,
      "Jockey One": true,
      "Silkscreen": true,
      "JetBrains Mono": true,
    },
  },
  icon: {
    mode: "svg",
    clientBundle: {
      scan: true,
    },
  },
  shiki: {
    bundledLangs: ["bash", "html", "javascript", "json", "markdown", "typescript", "vue"],
    bundledThemes: ["vesper"],
    highlightOptions: {
      theme: "vesper",
    },
  },
})
