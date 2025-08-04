<template>
  <section
    v-motion class="flex flex-col items-center gap-8 p-12 text-center"
    :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
    :duration="800"
  >
    <h1
      v-motion class="font-goldman"
      :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
      :duration="800"
    >
      Command-line Interface – SecretKeepR
    </h1>
  </section>
</template>

<script setup lang="ts">
useHead({
  title: "Command-Line Interface – SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/cli" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "The guide for the command-line interface for SecretKeepR, powered by Go." }],
})

useSeoMeta({
  title: "Command-Line Interface – SecretKeepR",
  description: "The guide for the command-line interface for SecretKeepR, powered by Go.",
})
</script>
