<template>
  <div v-motion class="min-h-screen flex flex-col items-center" :initial="{ opacity: 0, y: 40 }" :visible="{ opacity: 1, y: 0 }" :transition="{ duration: 1000 }">
    <header v-motion class="flex flex-col items-center text-center gap-4 p-12 border-b" :initial="{ opacity: 0, y: 20, scale: 0.8 }" :visible="{ opacity: 1, y: 0, scale: 1 }" :duration="600">
      <img src="/logo.png" alt="Logo" width="120" height="120">
      <h2>
        Sign In
      </h2>
      <p v-motion class="text-muted-foreground" :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }" :duration="600">
        Sign in with Google or GitHub to continue.
      </p>
    </header>

    <div v-motion class="flex flex-col items-center text-center gap-4 p-12" :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }" :duration="600">
      <div class="button-group">
        <button class="btn" @click="signIn('google', { callbackUrl: '/admin/projects' })">
          <Icon name="simple-icons:google" size="25" />
          <span>Sign In with Google</span>
        </button>
        <button class="btn" @click="signIn('github', { callbackUrl: '/admin/projects' })">
          <Icon name="simple-icons:github" size="25" />
          <span>Sign In with GitHub</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signIn } = useAuth()

useHead({
  title: "Sign In – SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/sign-in" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "Sign In to SecretKeepR." }],
})

useSeoMeta({
  title: "Sign In – SecretKeepR",
  description: "Sign In to SecretKeepR.",
})

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/admin/projects",
  },
})
</script>
