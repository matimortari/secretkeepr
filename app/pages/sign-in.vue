<template>
  <div class="flex flex-col items-center justify-center gap-4 bg-background p-8 md:flex-row md:p-24">
    <header
      v-motion class="card flex flex-col items-center gap-8 p-8 text-start md:flex-row"
      :initial="{ opacity: 0, x: -40 }" :visible="{ opacity: 1, x: 0 }"
      :duration="800"
    >
      <img src="/assets/logo.png" alt="Logo" width="120" height="120">

      <div class="flex flex-col items-center gap-2 md:items-start">
        <h1 class="font-goldman">
          Sign In
        </h1>

        <p class="text-center text-muted-foreground md:text-start">
          By continuing, you agree to our
          <nuxt-link to="/legal/privacy" class="text-primary hover:underline">
            Privacy Policy
          </nuxt-link> and
          <nuxt-link to="/legal/terms" class="text-primary hover:underline">
            Terms of Service
          </nuxt-link>.
        </p>
      </div>
    </header>

    <div
      v-motion class="flex flex-col items-center gap-8 p-8 text-center md:items-end md:p-12 md:text-start"
      :initial="{ opacity: 0, x: -40 }" :visible="{ opacity: 1, x: 0 }"
      :duration="800"
    >
      <nav class="flex w-full flex-col gap-4">
        <button
          v-for="provider in providers" :key="provider.name"
          class="btn" aria-label="Sign In with Provider"
          @click="navigateTo(`/api/auth/${provider.name}`, { external: true })"
        >
          <icon :name="provider.icon" size="25" />
          <span>{{ provider.label }}</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import guest from "~/lib/middleware/guest"

const providers = [
  {
    name: "google",
    label: "Sign In With Google",
    icon: "simple-icons:google",
  },
  {
    name: "github",
    label: "Sign In With GitHub",
    icon: "simple-icons:github",
  },
  {
    name: "gitlab",
    label: "Sign In With GitLab",
    icon: "simple-icons:gitlab",
  },
]

useHead({
  title: "Sign In - SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/sign-in" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "Sign In to SecretKeepR." }],
})

useSeoMeta({
  title: "Sign In - SecretKeepR",
  description: "Sign In to SecretKeepR.",
})

definePageMeta({
  middleware: guest,
})
</script>
