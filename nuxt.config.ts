import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  modules: ["@nuxt/icon", "@nuxtjs/google-fonts", "@pinia/nuxt", "@vueuse/motion/nuxt", "nuxt-auth-utils", "nuxt-shiki"],
  alias: {
    "#server": fileURLToPath(new URL("./server", import.meta.url)),
  },
  imports: {
    dirs: ["lib", "lib/middleware", "lib/services"],
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
    },
  },
  css: ["~/assets/styles.css"],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
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
  compatibilityDate: "2025-05-24",
})
