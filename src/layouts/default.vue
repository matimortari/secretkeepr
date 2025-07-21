<template>
  <div>
    <header class="navigation-group justify-between border-b-2 p-4">
      <div class="navigation-group">
        <NuxtLink to="/">
          <img
            src="/logo.png" alt="Logo"
            width="40" height="40"
            class="flex-shrink-0"
          >
        </NuxtLink>
        <p class="navigation-group text-sm text-muted-foreground">
          Please sign in to use all features.
        </p>
      </div>

      <div class="navigation-group">
        <NuxtLink to="/sign-in" class="btn">
          <Icon name="ph:sign-in-bold" size="20" />
          <span>Sign In</span>
        </NuxtLink>
        <button class="btn" @click="toggleTheme">
          <Icon :name="themeIcon" size="20" />
        </button>
      </div>
    </header>

    <main class="min-h-screen bg-gradient-to-br from-background to-muted p-4">
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
