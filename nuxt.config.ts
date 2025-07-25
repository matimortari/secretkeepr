import { defineNuxtConfig } from "nuxt/config"

export default defineNuxtConfig({
  modules: [
    "@nuxtjs/color-mode",
    "@nuxtjs/google-fonts",
    "@nuxt/icon",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@sidebase/nuxt-auth",
    "@vueuse/motion/nuxt",
  ],
  srcDir: "src",
  serverDir: "server",
  auth: {
    baseURL: `${process.env.BASE_URL}/api/auth`,
    originEnvKey: process.env.BASE_URL,
    provider: {
      type: "authjs",
      defaultProvider: "github",
    },
    globalAppMiddleware: true,
    sessionRefresh: {
      enablePeriodically: 20000,
      enableOnWindowFocus: true,
    },
  },
  colorMode: {
    classSuffix: "",
    preference: "system",
    fallback: "dark",
    storageKey: "nuxt-color-mode",
  },
  googleFonts: {
    families: {
      Roboto: true,
      Goldman: true,
      Silkscreen: true,
      JetBrainsMono: true,
    },
    display: "swap",
    prefetch: true,
    preconnect: true,
  },
  tailwindcss: {
    cssPath: "~/styles/globals.css",
  },
  compatibilityDate: "2025-05-24",
})
