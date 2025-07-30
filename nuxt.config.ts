import { defineNuxtConfig } from "nuxt/config"

export default defineNuxtConfig({
  modules: [
    "@nuxt/icon",
    "@nuxtjs/google-fonts",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@vueuse/motion/nuxt",
    "nuxt-auth-utils",
  ],
  srcDir: "src",
  serverDir: "server",
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
    },
    oauth: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectURL: `${process.env.NUXT_PUBLIC_BASE_URL}/api/auth/github`,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectURL: `${process.env.NUXT_PUBLIC_BASE_URL}/api/auth/google`,
      },
    },
  },
  googleFonts: {
    families: {
      Lato: true,
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
