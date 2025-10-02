<template>
  <div class="bg-background flex flex-col items-center justify-center p-8">
    <div class="hero-background" />

    <header
      v-motion class="flex flex-col items-center gap-8 border-b p-8 text-start"
      :initial="{ opacity: 0 }" :visible="{ opacity: 1 }"
      :duration="800"
    >
      <img src="/assets/logo-icon.png" alt="Logo Icon" width="80">

      <div class="flex flex-col items-center gap-4">
        <h1>
          Sign In
        </h1>

        <p class="text-muted-foreground text-center md:text-start">
          By continuing, you agree to our
          <nuxt-link to="/legal/privacy" class="text-primary hover:underline">
            Privacy Policy
          </nuxt-link> and
          <nuxt-link to="/legal/terms" class="text-primary hover:underline">
            Terms of Service
          </nuxt-link>.
        </p>
      </div>
    </header>

    <div
      v-motion class="flex flex-col items-center gap-8 p-8 text-center md:items-end md:text-start"
      :initial="{ opacity: 0, x: -20 }" :visible="{ opacity: 1, x: 0 }"
      :duration="800"
    >
      <nav class="flex w-full flex-col gap-4">
        <button
          v-for="provider in providers" :key="provider.name"
          class="btn" aria-label="Sign In with Provider"
          @click="navigateTo(`/api/auth/${provider.name}`, { external: true })"
        >
          <icon :name="provider.icon" size="25" />
          <span>{{ provider.label }}</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
const providers = [
  {
    name: "google",
    label: "Sign In With Google",
    icon: "simple-icons:google",
  },
  {
    name: "github",
    label: "Sign In With GitHub",
    icon: "simple-icons:github",
  },
  {
    name: "gitlab",
    label: "Sign In With GitLab",
    icon: "simple-icons:gitlab",
  },
]

useHead({
  title: "Sign In",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/sign-in" }],
  meta: [{ name: "description", content: "Sign In to SecretKeepR." }],
})

definePageMeta({
  middleware: guest,
})
</script>

<style scoped>
.hero-background {
  background: linear-gradient(360deg, var(--background) 20%, var(--primary) 80%, var(--secondary) 100%);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: top;
  animation: gradientGrow 10s ease-in-out infinite;
}

@keyframes gradientGrow {
  0% {
    transform: scaleY(0.5);
    opacity: 0.1;
  }
  50% {
    transform: scaleY(1);
    opacity: 0.2;
  }
  100% {
    transform: scaleY(0.5);
    opacity: 0.1;
  }
}
</style>
