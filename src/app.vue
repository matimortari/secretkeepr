<template>
  <NuxtLayout>
    <Analytics />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt"

useHead({
  htmlAttrs: {
    lang: "en",
  },
})
</script>
