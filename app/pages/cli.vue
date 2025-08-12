<template>
  <header
    v-motion class="flex flex-col items-center gap-4 border-b p-8 text-center"
    :initial="{ opacity: 0, scale: 0.8 }" :visible="{ opacity: 1, scale: 1 }"
    :duration="800"
  >
    <h2 class="font-goldman">
      Command-Line Interface
    </h2>
  </header>

  <div
    v-motion class="mx-auto flex max-w-3xl flex-col gap-4 p-4 text-left md:p-12"
    :initial="{ opacity: 0 }" :visible="{ opacity: 1 }"
    :duration="800"
  >
    TBA
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Command-Line Interface - SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/cli" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "The guide for the command-line interface for SecretKeepR, powered by Go." }],
})

useSeoMeta({
  title: "Command-Line Interface - SecretKeepR",
  description: "The guide for the command-line interface for SecretKeepR, powered by Go.",
})
</script>
