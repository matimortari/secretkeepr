<template>
  <footer class="footer-bg footer-vignette flex flex-col items-center justify-between gap-2 bg-contain p-8 md:flex-row">
    <p class="text-muted-foreground text-sm whitespace-nowrap">
      © {{ new Date().getFullYear() }} SecretKeepR. All rights reserved.
    </p>

    <div class="text-muted-foreground mx-4 flex flex-wrap items-center gap-4 text-sm font-light whitespace-nowrap">
      <nuxt-link to="/legal/privacy" class="hover:text-accent underline">
        Privacy Policy
      </nuxt-link>
      <nuxt-link to="/legal/terms" class="hover:text-accent underline">
        Terms of Service
      </nuxt-link>
      <nuxt-link to="https://github.com/matimortari/secretkeepr">
        <icon name="simple-icons:github" size="25" class="hover:scale-md hover:text-accent transition-all" />
      </nuxt-link>
    </div>
  </footer>
</template>
