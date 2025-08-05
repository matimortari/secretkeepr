<template>
  <header
    v-motion class="flex flex-col items-center gap-4 border-b p-8 text-center"
    :initial="{ opacity: 0, y: 20, scale: 0.8 }" :visible="{ opacity: 1, y: 0, scale: 1 }"
    :duration="800"
  >
    <img src="/assets/logo.png" alt="Logo" width="80" height="80">
    <h1 class="font-goldman">
      Sign In
    </h1>
    <p
      v-motion class="text-muted-foreground"
      :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
      :duration="800"
    >
      Sign in with your preferred account to access SecretKeepR.
    </p>
  </header>

  <div
    v-motion class="flex flex-col items-center gap-8 p-8 text-center md:p-12"
    :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
    :duration="800"
  >
    <nav class="flex flex-col items-center gap-4">
      <button v-for="provider in providers" :key="provider.name" class="btn" @click="provider.click">
        <Icon :name="provider.icon" size="25" />
        <span>{{ provider.label }}</span>
      </button>
    </nav>
  </div>

  <p class="my-4 text-center text-sm text-muted-foreground">
    By signing in, you agree to our
    <NuxtLink to="/legal/privacy" class="text-primary hover:underline">
      Privacy Policy
    </NuxtLink> and
    <NuxtLink to="/legal/terms" class="text-primary hover:underline">
      Terms of Service
    </NuxtLink>.
  </p>
</template>

<script setup lang="ts">
import guest from "~/lib/middleware/guest"

const providers = [
  {
    name: "github",
    label: "Sign In With GitHub",
    icon: "simple-icons:github",
    click: async () => {
      await navigateTo("/api/auth/github", { external: true })
    },
  },
  {
    name: "google",
    label: "Sign In With Google",
    icon: "simple-icons:google",
    click: async () => {
      await navigateTo("/api/auth/google", { external: true })
    },
  },
  {
    name: "gitlab",
    label: "Sign In With GitLab",
    icon: "simple-icons:gitlab",
    click: async () => {
      await navigateTo("/api/auth/gitlab", { external: true })
    },
  },
]

useHead({
  title: "Sign In – SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/sign-in" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "Sign In to SecretKeepR." }],
})

useSeoMeta({
  title: "Sign In – SecretKeepR",
  description: "Sign In to SecretKeepR.",
})

definePageMeta({
  middleware: guest,
})
</script>
