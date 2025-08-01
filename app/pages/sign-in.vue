<template>
  <header
    v-motion class="flex flex-col items-center gap-8 border-b p-12 text-center"
    :initial="{ opacity: 0, y: 20, scale: 0.8 }" :visible="{ opacity: 1, y: 0, scale: 1 }"
    :duration="800"
  >
    <img src="/logo.png" alt="Logo" width="120" height="120">
    <h1 class="font-goldman">
      Sign In
    </h1>
    <p
      v-motion class="text-muted-foreground"
      :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
      :duration="800"
    >
      Sign in with Google or GitHub to continue.
    </p>
  </header>

  <div
    v-motion class="flex flex-col items-center gap-4 p-12 text-center"
    :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
    :duration="800"
  >
    <nav class="navigation-group">
      <button v-for="provider in providers" :key="provider.name" class="btn" @click="provider.click">
        <Icon :name="provider.icon" size="25" />
        <span>{{ provider.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
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
