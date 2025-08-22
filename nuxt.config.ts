import { fileURLToPath } from "node:url"

export default defineNuxtConfig({
  modules: [
    "@nuxt/icon",
    "@nuxtjs/google-fonts",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@vueuse/motion/nuxt",
    "nuxt-auth-utils",
    "nuxt-shiki",
  ],
  alias: {
    "#server": fileURLToPath(new URL("./server", import.meta.url)),
  },
  imports: {
    dirs: ["lib", "lib/middleware", "lib/services", "lib/stores"],
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
    },
  },
  googleFonts: {
    display: "swap",
    prefetch: true,
    preconnect: true,
    families: {
      Lato: true,
      Goldman: true,
      Silkscreen: true,
      JetBrainsMono: true,
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
  tailwindcss: {
    cssPath: "~/assets/styles.css",
    quiet: true,
  },
  compatibilityDate: "2025-05-24",
})
