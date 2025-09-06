<template>
  <section
    id="hero" v-motion
    :initial="{ opacity: 0 }" :visible="{ opacity: 1 }"
    :duration="800" class="hero-container flex min-h-screen flex-col items-center px-4 py-20 text-center md:p-28 2xl:min-h-[60vh]"
  >
    <div class="hero-background" />

    <header class="z-20 flex w-full max-w-2xl flex-col items-center gap-8 border-b py-8">
      <div class="flex flex-col items-center gap-4">
        <h1>
          Your Secrets, Secured.
        </h1>
        <p class="text-muted-foreground max-w-lg leading-5">
          No more .env headaches. SecretKeepR is designed to help users and organizations securely manage and share secrets.
          It provides access controls for managing projects, users, and secrets.
        </p>
      </div>

      <div class="flex w-full flex-row items-center justify-center gap-8 md:gap-12">
        <nuxt-link to="/sign-in" class="btn-primary hero-btn group">
          <span>Get Started</span>
          <icon name="ph:arrow-right-bold" size="20" class="transition-transform group-hover:translate-x-1" />
        </nuxt-link>

        <nuxt-link to="/cli" class="flex flex-row items-center gap-2 text-sm font-semibold whitespace-nowrap hover:underline">
          <span>SecretKeepR CLI</span>
          <icon name="ph:terminal-window" size="30" />
        </nuxt-link>
      </div>
    </header>

    <div class="flex flex-wrap justify-center gap-8 py-12">
      <div
        v-for="(highlight, index) in highlights" :key="index"
        v-motion :initial="{ opacity: 0, y: 20 }"
        :visible="{ opacity: 1, y: 0 }" :duration="800"
        :delay="200 * index" class="flex flex-col items-center gap-2"
      >
        <span class="text-primary text-lg font-bold md:text-2xl">{{ highlight.title }}</span>
        <span class="text-muted-foreground text-sm">{{ highlight.description }}</span>
      </div>
    </div>
  </section>

  <section id="features" class="z-10 flex flex-col items-center gap-8 p-12">
    <h2 class="font-display">
      Features
    </h2>

    <div class="flex flex-col flex-wrap items-center justify-center gap-4 md:flex-row 2xl:flex-row 2xl:flex-nowrap">
      <div
        v-for="(feature, index) in features" :key="index"
        v-motion :initial="{ opacity: 0, y: -20 }"
        :visible="{ opacity: 1, y: 0 }" :duration="800"
        :delay="200 * index" class="flex max-w-sm min-w-[350px] grow-0 flex-col items-center gap-2 p-4 text-center"
      >
        <icon :name="feature.icon" class="text-primary" size="60" />
        <h3 class="font-display-alt tracking-tight whitespace-nowrap">
          {{ feature.title }}
        </h3>
        <p class="text-muted-foreground leading-5 tracking-tight">
          {{ feature.description }}
        </p>
      </div>
    </div>
  </section>

  <section
    id="how-to-use" v-motion
    :initial="{ opacity: 0 }" :visible="{ opacity: 1 }"
    :duration="800" class="flex flex-col items-center gap-8 border-y p-8 text-center md:p-12"
  >
    <h2 class="font-display">
      Getting Started
    </h2>

    <div class="grid grid-cols-1 gap-12 text-center md:grid-cols-5 md:gap-4">
      <div
        v-for="(step, index) in howToUseSteps" :key="index"
        v-motion :initial="{ opacity: 0, x: -20 }"
        :visible="{ opacity: 1, x: 0 }" :duration="800"
        :delay="200 * index" class="flex flex-col items-center gap-1"
      >
        <h5 class="whitespace-nowrap">
          {{ index + 1 }}. {{ step.title }}
        </h5>
        <p class="text-muted-foreground max-w-xs leading-5 tracking-tight">
          {{ step.description }}
        </p>
      </div>
    </div>
  </section>

  <section
    id="cli" v-motion
    :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
    :duration="800" class="flex flex-col items-center gap-8 p-8 text-center md:p-12 md:text-start"
  >
    <header class="flex flex-col items-center gap-2">
      <h2 class="font-display">
        Command Line Interface
      </h2>
      <p class="text-muted-foreground max-w-lg text-center leading-5">
        Manage secrets and projects directly from your terminal. Fast, secure, and open-source.
      </p>
    </header>

    <div class="relative flex w-full max-w-2xl flex-col gap-8">
      <article class="card flex flex-col p-0">
        <div class="text-muted-foreground flex items-center justify-between p-2 text-start text-sm leading-5">
          <p>
            > Install the CLI tool using the following command:
          </p>
          <button
            class="hover:scale-sm flex items-center transition-all" title="Copy to Clipboard"
            aria-label="Copy Install Command" @click="copyIcon.triggerCopy(installCommand)"
          >
            <icon :name="copyIcon.icon.value" size="20" />
          </button>
        </div>
        <Shiki lang="bash" :code="installCommand" class="code-block" />
      </article>

      <article class="card flex flex-col p-0">
        <p class="text-muted-foreground flex items-center justify-between p-2 text-start text-sm leading-5">
          > After installing, run the following commands to get started:
        </p>
        <Shiki lang="bash" :code="cliCommands.join('\n')" class="code-block" />
      </article>

      <div class="text-muted-foreground absolute right-2 bottom-2 z-10 hidden items-end gap-2 text-sm select-none md:flex">
        <span>Powered by Go</span>
        <img src="/assets/gopher.png" alt="Go Gopher" width="50" height="50">
      </div>
    </div>

    <p class="text-muted-foreground">
      Read the <nuxt-link to="/cli" class="text-primary hover:underline">
        documentation
      </nuxt-link> for more details.
    </p>
  </section>
</template>

<script setup lang="ts">
const { createActionHandler } = useActionIcon()
const copyIcon = createActionHandler("ph:copy-bold")

const highlights = [
  { title: "Fast Setup", description: "Get started in under 5 minutes." },
  { title: "Open Source", description: "Fully transparent & contributed by the community." },
  { title: "Secure by Design", description: "Secrets are encrypted end-to-end." },
]

const features = [
  { title: "End-to-End Encryption", description: "Your secrets are encrypted at rest and never exposed beyond the UI.", icon: "dinkie-icons:lock" },
  { title: "Access Control", description: "Manage who can view and edit secrets with fine-grained permissions.", icon: "dinkie-icons:entry" },
  { title: "Audit Logging", description: "Track sensitive operations like secret changes and organization updates.", icon: "dinkie-icons:right-magnifying-glass" },
  { title: "CLI Support", description: "Manage secrets and projects directly from your terminal.", icon: "dinkie-icons:window-browser" },
  { title: "Open Source", description: "Built with Go, TypeScript, and Nuxt.js. Contributions are welcome!", icon: "dinkie-icons:heart-black-suit-circled" },
]

const howToUseSteps = [
  { title: "Sign In", description: "Get started securely using Google, GitHub, or GitLab." },
  { title: "Create an Organization", description: "Set up your organization to manage projects and users." },
  { title: "Create a Project", description: "Group secrets by project to keep things organized." },
  { title: "Add Secrets", description: "Store and encrypt your environment variables." },
  { title: "Invite Teammates", description: "Assign roles and collaborate securely via the invite system." },
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
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app" }, { rel: "icon", href: "/favicon.svg" }],
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

.hero-container {
  border-bottom-width: 1px;
  box-shadow: 0 0 8px 2px var(--primary);
}

.hero-btn {
  box-shadow: 0 0 0 2px var(--primary);
  transition: box-shadow 0.5s ease;
  border-radius: 5rem;
}
.hero-btn:hover {
  box-shadow: 0 0 8px 2px var(--accent);
}
</style>
