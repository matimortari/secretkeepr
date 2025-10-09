<template>
  <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <header class="navigation-group border-b py-2">
      <h2>
        CLI Reference
      </h2>
    </header>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Command Line Interface",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/cli" }],
  meta: [{ name: "description", content: "SecretkeepR Command Line Interface." }],
})
</script>
