<template>
  <header class="navigation-group justify-between border-b-2 p-4">
    <NuxtLink to="/" class="hover:scale-sm flex flex-row items-center gap-2 transition-all">
      <img
        src="/logo.png" alt="Logo"
        width="40" height="40"
        class="rounded-full"
      >
      <span class="text-xl font-semibold">SecretKeepR</span>
    </NuxtLink>

    <nav class="navigation-group">
      <button class="btn" @click="toggleTheme">
        <Icon :name="themeIcon" size="20" />
      </button>
      <NuxtLink to="/sign-in" class="btn">
        <Icon name="ph:sign-in-bold" size="20" />
        <span class="hidden md:inline">Sign In</span>
      </NuxtLink>
    </nav>
  </header>

  <main class="min-h-screen overflow-hidden p-4">
    <slot />
  </main>

  <Footer />
</template>

<script setup lang="ts">
const { themeIcon, toggleTheme } = useTheme()
</script>
