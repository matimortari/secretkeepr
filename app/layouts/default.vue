<template>
  <header class="navigation-group justify-between border-b-2 bg-card p-4">
    <nuxt-link to="/" class="hover:scale-sm flex flex-row items-center gap-2 transition-all">
      <img
        src="/assets/logo.png" alt="Logo"
        width="40" height="40"
        class="rounded-full"
      >
    </nuxt-link>

    <nuxt-link to="/sign-in" class="btn">
      <icon name="ph:sign-in-bold" size="20" />
      <span class="hidden md:inline">Sign In</span>
    </nuxt-link>
  </header>

  <main class="bg-image min-h-screen overflow-hidden">
    <slot />
  </main>

  <Footer />
</template>
