<template>
  <div class="bg-card sticky top-0 z-30 border-b px-4 py-8 md:px-12">
    <header class="flex flex-col items-start gap-2">
      <div class="flex flex-row items-center gap-4">
        <nuxt-link to="/" aria-label="Go back" class="hover:text-primary transition-colors">
          <icon name="ph:arrow-left-bold" size="30" />
        </nuxt-link>
        <h2>
          Command-Line Interface
        </h2>
      </div>
      <p class="text-muted-foreground text-sm leading-5">
        The guide for the command-line interface for SecretKeepR.
      </p>
    </header>
    <button class="btn absolute top-4 right-4" aria-label="Toggle Theme" @click="toggleTheme">
      <icon :name="themeIcon" size="20" />
    </button>
  </div>

  <div class="mx-auto flex w-full flex-row justify-between px-8 md:pl-20">
    <article
      v-motion class="flex flex-col gap-4 px-4 py-12 text-start md:px-12"
      :initial="{ opacity: 0 }" :visible="{ opacity: 1 }"
      :duration="800"
    >
      <section v-for="(section, index) in cliContent" :key="index" class="my-4 space-y-2">
        <h3 :id="section.title.toLowerCase().replace(/\s+/g, '-')">
          {{ section.title }}
        </h3>

        <p v-for="(para, i) in section.body" :key="`para-${i}`" class="text-muted-foreground" v-html="para" />
        <ul v-if="section.list" class="text-muted-foreground list-disc space-y-1 pl-6">
          <li v-for="(item, i) in section.list" :key="`li-${index}-${i}`">
            {{ item }}
          </li>
        </ul>
      </section>
    </article>

    <aside class="sticky top-24 hidden w-72 min-w-72 self-start rounded-b-lg p-4 text-end text-sm md:block">
      <nav class="my-8 space-y-4">
        <h4 class="border-b py-4">
          On this page
        </h4>
        <ul class="text-muted-foreground space-y-2">
          <li v-for="(section, index) in cliContent" :key="`toc-${index}`">
            <a
              :href="`#${section.title?.toLowerCase().replace(/\s+/g, '-')}`" class="hover:text-primary block transition-colors"
              :class="{ 'text-primary border-primary border-r-4 pr-2 font-semibold': activeSection === section.title.toLowerCase().replace(/\s+/g, '-') }"
            >
              {{ section.title }}
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
const { toggleTheme, themeIcon } = useTheme()
const { activeSection } = useActiveHeading()

const cliContent = [
  {
    title: "Introduction",
    body: [
      "The SecretKeepR Command-Line Interface (CLI) is a powerful tool that allows you to manage your secrets directly from the terminal. This guide will walk you through the installation, configuration, and usage of the CLI.",
    ],
    list: [],
  },
  {
    title: "Installation",
    body: [
      "To install the SecretKeepR CLI, follow these steps:",
    ],
    list: [
      "Download the latest release from the [GitHub releases page]",
    ],
  },
]

useHead({
  title: "Command-Line Interface",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/cli" }],
  meta: [{ name: "description", content: "The guide for the command-line interface for SecretKeepR, powered by Go." }],
})
</script>
