<template>
  <div>
    <header class="flex flex-row items-center justify-between gap-2 p-4 border-b-2">
      <div class="flex flex-row items-center gap-2">
        <NuxtLink to="/">
          <img
            src="/logo.png" alt="Logo"
            width="40" height="40"
            class="flex-shrink-0"
          >
        </NuxtLink>
        <p class="flex flex-row items-center gap-2 text-muted-foreground text-sm">
          Please sign in to use all features.
        </p>
      </div>

      <div class="flex flex-row items-center gap-2">
        <NuxtLink to="/sign-in" class="btn">
          Sign In
        </NuxtLink>
        <button class="btn" @click="toggleTheme">
          <Icon :name="themeIcon" size="20" />
        </button>
      </div>
    </header>

    <main class="min-h-screen p-4 bg-gradient-to-br from-background to-muted">
      <slot />
    </main>

    <footer class="py-4 text-center text-sm">
      <p>© {{ new Date().getFullYear() }} – SecretKeepR</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { themeIcon, toggleTheme } = useTheme()
</script>
