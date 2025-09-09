<template>
  <header class="flex flex-col items-start gap-2 border-b p-8 pt-24 text-start">
    <h2 class="font-display">
      Command-Line Interface
    </h2>
    <p class="text-muted-foreground">
      Learn how to use the SecretKeepR CLI.
    </p>
  </header>

  <div class="mx-auto flex gap-8 px-8 py-4 md:px-24">
    <article
      v-motion class="flex flex-col gap-4 p-4 text-start"
      :initial="{ opacity: 0 }" :visible="{ opacity: 1 }"
      :duration="800"
    >
      <section v-for="(section, index) in cliContent" :key="index">
        <h3>
          {{ section.title }}
        </h3>

        <p v-for="(para, i) in section.body" :key="`para-${i}`" class="text-muted-foreground" v-html="para" />
        <ul class="text-muted-foreground list-disc">
          <li v-for="(item, i) in section.list" :key="`li-${index}-${i}`">
            {{ item }}
          </li>
        </ul>
      </section>
    </article>

    <aside class="bg-card sticky top-24 hidden w-72 self-start rounded-lg p-4 text-end shadow-2xl lg:block">
      <nav class="space-y-4">
        <h3 class="border-b py-4">
          On this page
        </h3>
        <ul class="text-muted-foreground space-y-1 text-sm">
          <li v-for="(section, index) in cliContent" :key="`toc-${index}`">
            <a :href="`#${section.title?.toLowerCase().replace(/\s+/g, '-')}`" class="hover:text-primary block transition-colors">
              {{ section.title }}
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
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
  title: "Command-Line Interface - SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/cli" }, { rel: "icon", href: "/favicon.svg" }],
  meta: [{ name: "description", content: "The guide for the command-line interface for SecretKeepR, powered by Go." }],
})

useSeoMeta({
  title: "Command-Line Interface - SecretKeepR",
  description: "The guide for the command-line interface for SecretKeepR, powered by Go.",
})
</script>
