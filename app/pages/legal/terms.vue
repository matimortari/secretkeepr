<template>
  <header
    v-motion class="flex flex-col items-center gap-4 border-b p-8 text-center"
    :initial="{ opacity: 0, scale: 0.8 }" :visible="{ opacity: 1, scale: 1 }"
    :duration="800"
  >
    <img src="/assets/logo-icon.png" alt="Logo" width="80" height="80">
    <h2 class="font-display">
      Terms of Service
    </h2>
    <p class="text-muted-foreground">
      Review the rules and terms for using SecretKeepR.
    </p>
  </header>

  <div
    v-motion class="mx-auto flex max-w-3xl flex-col gap-4 p-4 text-left md:p-12"
    :initial="{ opacity: 0 }" :visible="{ opacity: 1 }"
    :duration="800"
  >
    <p class="text-sm">
      Effective Date: August 5, 2025
    </p>

    <section v-for="(section, index) in termsContent" :key="index">
      <h3>
        {{ section.title }}
      </h3>

      <p v-for="(para, i) in section.body" :key="`para-${i}`" v-html="para" />
      <ul class="list-disc">
        <li v-for="(item, i) in section.list" :key="`li-${index}-${i}`">
          {{ item }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
const termsContent = [
  {
    title: "Using SecretKeepR",
    body: [
      "By accessing or using SecretKeepR, you agree to these Terms of Service. You must be at least 13 years old to use the service.",
    ],
  },
  {
    title: "Your Responsibilities",
    list: [
      "Keep your account credentials secure",
      "Do not use the platform for illegal activities",
      "You are responsible for all activity under your account",
    ],
  },
  {
    title: "Termination",
    body: [
      "We reserve the right to suspend or terminate your access if you violate these terms.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "SecretKeepR is provided \"as is\". We are not liable for data loss, downtime, or misuse.",
    ],
  },
  {
    title: "Modifications",
    body: [
      "We may update these terms periodically. Continued use constitutes acceptance of the new terms.",
    ],
  },
  {
    title: "Contact",
    body: [
      `If you have any questions, email us at 
      <a href="mailto:matheus.felipe.19rt@gmail.com" class='text-primary underline hover:text-primary/80'>
        matheus.felipe.19rt@gmail.com
      </a>.`,
    ],
  },
]

useHead({
  title: "Terms of Service - SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/legal/terms" }, { rel: "icon", href: "/favicon.svg" }],
  meta: [{ name: "description", content: "Read the terms of service for SecretKeepR." }],
})

useSeoMeta({
  title: "Terms of Service - SecretKeepR",
  description: "Read the terms of service for SecretKeepR.",
})
</script>
