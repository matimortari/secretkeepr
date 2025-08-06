import { fileURLToPath } from "node:url"

export default defineNuxtConfig({
  modules: [
    "@nuxt/icon",
    "@nuxtjs/google-fonts",
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@vueuse/motion/nuxt",
    "nuxt-auth-utils",
  ],
  alias: {
    "#server": fileURLToPath(new URL("./server", import.meta.url)),
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
    },
    oauth: {
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
        redirectURL: `${process.env.NUXT_PUBLIC_BASE_URL}/api/auth/github`,
      },
      gitlab: {
        clientId: process.env.NUXT_OAUTH_GITLAB_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GITLAB_CLIENT_SECRET,
        redirectURL: `${process.env.NUXT_PUBLIC_BASE_URL}/api/auth/gitlab`,
      },
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,
        redirectURL: `${process.env.NUXT_PUBLIC_BASE_URL}/api/auth/google`,
      },
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
  tailwindcss: {
    cssPath: "~/assets/styles.css",
  },
  compatibilityDate: "2025-05-24",
})
