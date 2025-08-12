<template>
  <section
    id="hero" v-motion
    class="md:gradient-mask-wrapper flex flex-col items-center gap-8 border-b bg-card p-8 text-center md:p-16" :initial="{ opacity: 0 }"
    :visible="{ opacity: 1 }" :duration="800"
  >
    <h1 class="font-goldman">
      Your Secrets, Secured and Organized
    </h1>
    <p class="max-w-2xl text-lg leading-5 text-muted-foreground">
      No more .env headaches. SecretKeepR is a secrets manager designed to help users and organizations securely manage
      and share environment variables. It provides access controls for managing projects, users, and secrets across organizations.
    </p>

    <nuxt-link to="/sign-in" class="btn-primary rounded-full">
      <span>Get Started</span>
      <icon name="ph:arrow-right-bold" size="20" />
    </nuxt-link>
  </section>

  <section
    id="features" v-motion
    class="relative flex flex-col items-center gap-8 p-8 text-center md:p-12" :initial="{ opacity: 0, x: -20 }"
    :visible="{ opacity: 1, x: 0 }" :duration="800"
  >
    <h2 class="font-goldman">
      Features
    </h2>

    <div class="flex flex-col flex-wrap items-center justify-center md:flex-row">
      <div
        v-for="(feature, index) in features" :key="index"
        v-motion class="flex min-w-[350px] max-w-sm flex-grow-0 flex-col items-center gap-2 p-8"
        :initial="{ opacity: 0, y: -20 }" :visible="{ opacity: 1, y: 0 }"
        :duration="800" :delay="200 * index"
      >
        <icon :name="feature.icon" class="text-primary" size="60" />
        <h4 class="whitespace-nowrap font-silkscreen tracking-tight">
          {{ feature.title }}
        </h4>
        <p class="leading-5 tracking-tight text-muted-foreground">
          {{ feature.description }}
        </p>
      </div>
    </div>
  </section>

  <section
    id="how-to-use" v-motion
    class="flex flex-col items-center gap-8 border-y p-8 text-center md:p-12" :initial="{ opacity: 0 }"
    :visible="{ opacity: 1 }" :duration="800"
  >
    <h2 class="font-goldman">
      Getting Started
    </h2>

    <div class="grid grid-cols-1 gap-4 text-center md:grid-cols-5">
      <div
        v-for="(step, index) in howToUseSteps" :key="index"
        v-motion class="flex flex-col items-center gap-1"
        :initial="{ opacity: 0, x: -20 }" :visible="{ opacity: 1, x: 0 }"
        :duration="800" :delay="200 * index"
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
    id="cli" v-motion
    class="flex flex-col items-center gap-8 p-8 text-center md:p-12 md:text-start" :initial="{ opacity: 0, y: 20 }"
    :visible="{ opacity: 1, y: 0 }" :duration="800"
  >
    <div class="card relative flex w-full flex-col items-center gap-4 p-8">
      <header class="flex flex-col items-center gap-2">
        <h2 class="font-goldman">
          Command Line Interface
        </h2>
        <p class="max-w-lg text-center leading-5 text-muted-foreground">
          Manage secrets and projects directly from your terminal. Fast, secure, and open-source. Read the
          <nuxt-link to="/cli" class="text-primary">
            documentation
          </nuxt-link> for more details.
        </p>
      </header>

      <div class="flex w-full flex-col gap-8 md:flex-row md:items-center">
        <div class="card flex flex-col gap-2">
          <p class="text-sm leading-5 text-muted-foreground">
            Install the CLI tool using the following command:
          </p>

          <div class="code-block relative w-full max-w-full md:max-w-lg">
            <span class="block overflow-x-auto whitespace-nowrap">
              {{ installCommand }}
            </span>
            <button
              class="hover:scale-sm absolute right-2 top-2 z-10 text-muted-foreground transition-all" title="Copy"
              aria-label="Copy Install Command" @click="installClipboard.copy(installCommand)"
            >
              <icon :name="installClipboard.copyIcon.value" size="20" />
            </button>
          </div>
        </div>

        <div class="card flex flex-col gap-2">
          <p class="text-sm leading-5 text-muted-foreground">
            After installing, run the following commands to get started:
          </p>

          <div class="code-block relative w-full max-w-full md:max-w-lg">
            <div class="overflow-x-auto">
              <span v-for="(command, index) in cliCommands" :key="index" class="block whitespace-nowrap">
                {{ command }}
              </span>
            </div>
            <button
              class="hover:scale-sm absolute right-2 top-2 z-10 text-muted-foreground transition-all" title="Copy"
              aria-label="Copy CLI Commands" @click="cliClipboard.copy(cliCommands.join('\n'))"
            >
              <icon :name="cliClipboard.copyIcon.value" size="20" />
            </button>
          </div>
        </div>
      </div>

      <div class="absolute bottom-2 right-2 z-10 hidden select-none items-end gap-2 font-semibold text-muted-foreground md:flex">
        <span>Powered by Go</span>
        <img src="/assets/gopher.png" alt="Go Gopher" width="60" height="60">
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import guest from "~/lib/middleware/guest"

const { createClipboardHandler } = useClipboard()

const installClipboard = createClipboardHandler()
const cliClipboard = createClipboardHandler()

const features = [
  {
    title: "End-to-End Encryption",
    description: "Your secrets are encrypted at rest and never exposed beyond the UI.",
    icon: "dinkie-icons:lock",
  },
  {
    title: "Access Control",
    description: "Manage who can view and edit secrets with fine-grained permissions.",
    icon: "dinkie-icons:entry",
  },
  {
    title: "Audit Logging",
    description: "Track sensitive operations like secret changes and organization updates.",
    icon: "dinkie-icons:right-magnifying-glass",
  },
  {
    title: "CLI Support",
    description: "Manage secrets and projects directly from your terminal.",
    icon: "dinkie-icons:window-browser",
  },
  {
    title: "Open Source",
    description: "Built with Go, TypeScript, and Nuxt.js. Contributions are welcome!",
    icon: "dinkie-icons:heart-black-suit-circled",
  },
]

const howToUseSteps = [
  {
    title: "Sign In",
    description: "Get started securely using Google, GitHub, or GitLab.",
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

useHead({
  title: "SecretKeepR - Securely Manage Your Environment Variables",
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
  title: "SecretKeepR - Securely Manage Your Environment Variables",
  description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
  ogTitle: "SecretKeepR - Securely Manage Your Environment Variables",
  ogDescription: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
  ogImage: "https://secretkeepr.vercel.app/og-image.png",
  ogUrl: "https://secretkeepr.vercel.app",
})

definePageMeta({
  middleware: guest,
})
</script>

<style scoped>
.gradient-mask-wrapper::before,
.gradient-mask-wrapper::after {
  content: "";
  position: absolute;
  top: 0;
  width: 200px;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.gradient-mask-wrapper::before {
  left: 0;
  background: linear-gradient(to right, rgba(10, 11, 12, 0.8) 0%, rgba(10, 11, 12, 0.2) 100%);
}

.gradient-mask-wrapper::after {
  right: 0;
  background: linear-gradient(to left, rgba(10, 11, 12, 0.8) 0%, rgba(10, 11, 12, 0.2) 100%);
}
</style>
