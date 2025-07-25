<template>
  <div
    v-motion class="flex flex-col overflow-hidden"
    :initial="{ opacity: 0, y: 40 }" :visible="{ opacity: 1, y: 0 }"
    :transition="{ duration: 800 }"
  >
    <section
      id="hero"
      v-motion class="flex flex-col items-center gap-8 p-16 text-center"
      :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
      :transition="{ duration: 800 }"
    >
      <h1
        v-motion class="font-goldman"
        :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
        :transition="{ duration: 800, delay: 0.3 }"
      >
        Securely Manage Your Environment Variables
      </h1>
      <p
        v-motion class="max-w-xl leading-5"
        :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
        :transition="{ duration: 800, delay: 0.3 }"
      >
        SecretKeepR is a secrets manager designed to help users and organizations securely manage and share environment variables. It provides access controls for managing projects, users, and secrets across organizations.
      </p>
      <NuxtLink to="/sign-in" class="btn-primary rounded-full">
        <span>Get Started</span>
        <Icon name="ph:arrow-right-bold" size="20" />
      </NuxtLink>
    </section>

    <section
      id="features" v-motion
      :initial="{ opacity: 0, y: 40, scale: 0.8 }" :visible="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{ duration: 800, delay: 0.5 }" class="grid grid-cols-1 gap-12 border-b p-16 text-center md:grid-cols-3"
    >
      <div
        v-for="(feature, index) in features" :key="index"
        v-motion class="flex flex-col items-center gap-4"
        :initial="{ opacity: 0, y: -40 }" :visible="{ opacity: 1, y: 0 }"
        :transition="{ duration: 800, delay: index * 0.8 }"
      >
        <Icon :name="feature.icon" class="text-primary" size="60" />
        <h3 class="font-silkscreen tracking-tight md:whitespace-nowrap">
          {{ feature.title }}
        </h3>
        <p class="max-w-xs leading-5 tracking-tight text-muted-foreground">
          {{ feature.description }}
        </p>
      </div>
    </section>

    <section
      id="how-to-use"
      v-motion class="flex flex-col items-center gap-12 border-b p-16 text-center"
      :initial="{ opacity: 0, y: 40 }" :visible="{ opacity: 1, y: 0 }"
      :transition="{ duration: 800, delay: 0.5 }"
    >
      <h2 class="font-goldman">
        Getting Started
      </h2>

      <div class="grid grid-cols-1 gap-4 text-center md:grid-cols-5">
        <div
          v-for="(step, index) in howToUseSteps" :key="index"
          v-motion class="flex flex-col items-center gap-1"
          :initial="{ opacity: 0, y: -40 }" :visible="{ opacity: 1, y: 0 }"
          :transition="{ duration: 800, delay: index * 0.4 }"
        >
          <h5 class="whitespace-nowrap">
            {{ index + 1 }}. {{ step.title }}
          </h5>
          <p class="max-w-xs leading-5 tracking-tight text-muted-foreground">
            {{ step.description }}
          </p>
        </div>
      </div>
    </section>

    <section
      id="cli"
      v-motion
      class="flex w-full flex-col gap-8 p-16 text-center md:text-start"
      :initial="{ opacity: 0, y: 40 }"
      :visible="{ opacity: 1, y: 0 }"
      :transition="{ duration: 800, delay: 0.5 }"
    >
      <div class="flex flex-col items-center justify-between gap-8 md:flex-row">
        <div class="flex-1 space-y-4">
          <h2 class="font-goldman">
            Command Line Interface
          </h2>
          <p class="max-w-lg leading-5 text-muted-foreground">
            Manage secrets and projects directly from your terminal. Fast, secure, and open-source. Read the
            <NuxtLink to="/cli" class="text-primary">
              documentation
            </NuxtLink> for more details.
          </p>
        </div>

        <div class="relative flex w-full max-w-xl gap-4 text-start">
          <div
            class="flex cursor-pointer flex-row gap-4 rounded-lg bg-[#0d1117] p-4 font-mono transition-all hover:translate-x-1 hover:shadow-lg"
            title="Copy to clipboard"
            @click="copyToClipboard(installCommand)"
          >
            <span>{{ installCommand }}</span>
          </div>
        </div>
      </div>

      <div class="flex w-full flex-col items-center gap-4">
        <p class="text-muted-foreground">
          After installing, run the following commands to get started:
        </p>

        <div
          class="relative w-full max-w-4xl cursor-pointer rounded-lg bg-[#0d1117] p-4 text-start font-mono transition-all hover:translate-x-1 hover:shadow-lg"
          title="Copy to clipboard"
          @click="copyToClipboard(cliCommands.join('\n'))"
        >
          <span v-for="(cmd, index) in cliCommands" :key="index" class="block">
            {{ cmd }}
          </span>

          <div class="absolute bottom-2 right-2 z-10 flex select-none items-end gap-2 font-semibold text-muted-foreground">
            <span>Powered by Go</span>
            <img src="/gopher.png" width="60" height="60">
          </div>
        </div>
      </div>
    </section>
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

const installCommand = "go install github.com/matimortari/secretkeepr/cli@latest"

const cliCommands = [
  "secretkeepr login",
  "secretkeepr create org my-org",
  "secretkeepr create project my-project",
  "secretkeepr add secret MY_SECRET my-secret-value",
]

function copyToClipboard(val: string) {
  if (val)
    navigator.clipboard.writeText(val)
}

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
