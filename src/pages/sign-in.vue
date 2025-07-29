<template>
  <header
    v-motion class="flex flex-col items-center gap-8 border-b p-12 text-center"
    :initial="{ opacity: 0, y: 20, scale: 0.8 }" :visible="{ opacity: 1, y: 0, scale: 1 }"
    :transition="{ duration: 600 }"
  >
    <img src="/logo.png" alt="Logo" width="120" height="120">
    <h1 class="font-goldman">
      Sign In
    </h1>
    <p
      v-motion class="text-muted-foreground"
      :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
      :transition="{ duration: 600 }"
    >
      Sign in with Google or GitHub to continue.
    </p>
  </header>

  <div
    v-motion class="flex flex-col items-center gap-4 p-12 text-center"
    :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
    :transition="{ duration: 600 }"
  >
    <nav class="navigation-group">
      <button v-for="provider in providers" :key="provider.label" class="btn" @click="provider.click">
        <Icon :name="provider.icon" size="25" />
        <span>{{ provider.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
const providers = [
  {
    label: "GitHub",
    icon: "simple-icons:github",
    click: async () => {
      await navigateTo("/api/auth/github", { external: true })
    },
  },
  {
    label: "Google",
    icon: "logos:google-icon",
    click: async () => {
      await navigateTo("/api/auth/google", { external: true })
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
</script>
