<template>
  <footer class="footer-bg flex flex-col items-center justify-between gap-2 p-8 md:flex-row">
    <div class="mx-4 flex flex-wrap items-center gap-4 whitespace-nowrap text-sm font-light text-muted-foreground">
      <p>© {{ new Date().getFullYear() }} SecretKeepR. All rights reserved.</p>

      <NuxtLink to="/legal/privacy" class="underline hover:text-accent">
        Privacy Policy
      </NuxtLink>
      <NuxtLink to="/legal/terms" class="underline hover:text-accent">
        Terms of Service
      </NuxtLink>
    </div>

    <NuxtLink to="https://github.com/matimortari/secretkeepr" target="_blank" rel="noopener noreferrer">
      <Icon name="simple-icons:github" size="25" class="hover:scale-md transition-all hover:text-accent" />
    </NuxtLink>
  </footer>
</template>
