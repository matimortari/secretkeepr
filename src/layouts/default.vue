<template>
  <header class="navigation-group justify-between border-b-2 p-4">
    <NuxtLink to="/">
      <img
        src="/logo.png" alt="Logo"
        width="40" height="40"
        class="hover:scale-md flex-shrink-0 transition-all"
      >
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

  <main class="min-h-screen overflow-x-hidden bg-gradient-to-br from-muted via-background to-background p-4">
    <slot />
  </main>

  <footer class="py-4 text-center text-sm md:p-8">
    <p>© {{ new Date().getFullYear() }} – SecretKeepR</p>
  </footer>
</template>

<script setup lang="ts">
const { themeIcon, toggleTheme } = useTheme()
</script>
