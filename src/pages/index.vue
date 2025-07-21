<template>
  <div
    v-motion class="flex min-h-screen flex-col items-center"
    :initial="{ opacity: 0, y: 40 }" :visible="{ opacity: 1, y: 0 }"
    :transition="{ duration: 1000 }"
  >
    <div
      v-motion class="flex flex-col items-center gap-4 border-b p-12 text-center"
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
        <span>Get Started</span>
        <Icon name="ph:arrow-right-bold" size="20" />
      </NuxtLink>
    </div>

    <section
      id="features" v-motion
      :initial="{ opacity: 0, y: 30, scale: 0.9 }" :visible="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{ delay: 0.5, duration: 1000 }" class="grid max-w-4xl grid-cols-1 gap-8 border-b py-12 text-center md:grid-cols-3"
    >
      <div v-for="(feature, index) in features" :key="index" class="flex flex-col items-center gap-4">
        <Icon :name="feature.icon" class="text-primary" size="50" />
        <h3 class="whitespace-nowrap">
          {{ feature.title }}
        </h3>
        <p class="tracking-tight text-muted-foreground">
          {{ feature.description }}
        </p>
      </div>
    </section>

    <div class="flex flex-col items-center gap-12 p-12 text-center">
      <h2>
        How to Use SecretKeepR
      </h2>

      <div class="grid grid-cols-1 gap-4 text-center md:grid-cols-5">
        <div v-for="(step, index) in howToUseSteps" :key="index" class="flex flex-col items-center gap-1">
          <h4 class="whitespace-nowrap">
            {{ index + 1 }}. {{ step.title }}
          </h4>
          <p class="tracking-tight text-muted-foreground">
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const features = [
  {
    title: "End-to-End Encryption",
    description: "Your secrets are encrypted at rest and never exposed beyond the UI.",
    icon: "dinkie-icons:lock",
  },
  {
    title: "Role-Based Access Control",
    description: "Manage who can view and edit secrets with fine-grained permissions.",
    icon: "dinkie-icons:entry",
  },
  {
    title: "Audit Logs",
    description: "Track sensitive operations like secret changes and organization updates.",
    icon: "dinkie-icons:right-magnifying-glass",
  },
]

const howToUseSteps = [
  {
    title: "Sign In",
    description: "Use GitHub or Google to get started securely.",
  },
  {
    title: "Create an Organization",
    description: "Set up your organization to manage projects and users.",
  },
  {
    title: "Create a Project",
    description: "Group secrets by project to keep things organized.",
  },
  {
    title: "Add Secrets",
    description: "Store and encrypt your environment variables.",
  },
  {
    title: "Invite Teammates",
    description: "Assign roles and collaborate securely via the invite system.",
  },
]

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
