<template>
  <div
    v-motion class="min-h-screen flex flex-col items-center"
    :initial="{ opacity: 0, y: 40 }" :visible="{ opacity: 1, y: 0 }"
    :transition="{ duration: 1000 }"
  >
    <div
      v-motion class="flex flex-col items-center text-center gap-4 p-12 border-b"
      :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
      :duration="600"
    >
      <h1>
        Securely Manage Your Environment Variables
      </h1>
      <p
        v-motion class="max-w-xl"
        :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.3, duration: 1000 }"
      >
        SecretKeepR is a secrets manager designed to help users and organizations securely manage and share environment variables. It provides access controls for managing projects, users, and secrets across organizations.
      </p>

      <NuxtLink to="/sign-in" class="btn-primary">
        Get Started
      </NuxtLink>
    </div>

    <section
      id="features" v-motion
      :initial="{ opacity: 0, y: 30, scale: 0.9 }" :visible="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{ delay: 0.5, duration: 1000 }" class="py-12 max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
    >
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-4 size-12 text-primary"
          fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 1.104-.448 2-1 2s-1-.896-1-2 .448-2 1-2 1 .896 1 2z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 10v-2a5 5 0 1110 0v2" />
        </svg>
        <h4>
          End-to-End Encryption
        </h4>
        <p class="text-muted-foreground tracking-tight">
          Your secrets are encrypted at rest and never exposed beyond the UI.
        </p>
      </div>

      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-4 size-12 text-primary"
          fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M3 14h18M7 6h10M7 18h10" />
        </svg>
        <h4>
          Role-Based Access Control
        </h4>
        <p class="text-muted-foreground tracking-tight">
          Manage who can view and edit secrets with fine-grained permissions.
        </p>
      </div>

      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-4 size-12 text-primary"
          fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" />
        </svg>
        <h4>
          Audit Logs
        </h4>
        <p class="text-muted-foreground tracking-tight">
          Track sensitive operations like secret changes and organization updates.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "SecretKeepR – Securely Manage Your Environment Variables",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [
    { name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." },
    { property: "og:title", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." },
    { property: "og:description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." },
    { property: "og:type", content: "website" },
    { property: "og:image", content: "https://secretkeepr.vercel.app/og-image.png" },
    { property: "og:url", content: "https://secretkeepr.vercel.app" },
    { name: "google-site-verification", content: "2j0bcfhh8FCYPpzFylzbiPjl3Pa0X7lMuG060ctsCsA" },
  ],
})

useSeoMeta({
  title: "SecretKeepR – Securely Manage Your Environment Variables",
  description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
  ogTitle: "SecretKeepR – Securely Manage Your Environment Variables",
  ogDescription: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
  ogImage: "https://secretkeepr.vercel.app/og-image.png",
  ogUrl: "https://secretkeepr.vercel.app",
})

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/admin/projects",
  },
})
</script>
