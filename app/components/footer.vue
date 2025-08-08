<template>
  <footer class="footer-bg flex flex-col items-center justify-between gap-2 bg-contain p-8 md:flex-row">
    <p class="whitespace-nowrap text-sm text-muted-foreground">
      © {{ new Date().getFullYear() }} SecretKeepR. All rights reserved.
    </p>

    <div class="mx-4 flex flex-wrap items-center gap-4 whitespace-nowrap text-sm font-light text-muted-foreground">
      <nuxt-link to="/legal/privacy" class="underline hover:text-accent">
        Privacy Policy
      </nuxt-link>
      <nuxt-link to="/legal/terms" class="underline hover:text-accent">
        Terms of Service
      </nuxt-link>
      <nuxt-link to="https://github.com/matimortari/secretkeepr" target="_blank" rel="noopener noreferrer">
        <icon name="simple-icons:github" size="25" class="hover:scale-md transition-all hover:text-accent" />
      </nuxt-link>
    </div>
  </footer>
</template>
