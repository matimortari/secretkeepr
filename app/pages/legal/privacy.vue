<template>
  <header
    v-motion class="flex flex-col items-center gap-4 border-b p-8 text-center"
    :initial="{ opacity: 0, scale: 0.8 }" :visible="{ opacity: 1, scale: 1 }"
    :duration="800"
  >
    <img src="/assets/logo-icon.png" alt="Logo" width="80" height="80">
    <h2 class="font-display">
      Privacy Policy
    </h2>
    <p class="text-muted-foreground">
      Learn how SecretKeepR collects, uses, and protects your data.
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

    <section v-for="(section, index) in privacyContent" :key="index">
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
const privacyContent = [
  {
    body: [
      `SecretKeepR ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information.`,
    ],
  },
  {
    title: "Information We Collect",
    list: [
      "OAuth profile data (name, email, avatar)",
      "Usage logs and audit events",
      "Secrets (encrypted and unreadable to us)",
    ],
  },
  {
    title: "How We Use Your Data",
    list: [
      "To provide and improve the service",
      "To communicate essential updates",
      "To maintain security and compliance",
    ],
  },
  {
    title: "Your Rights",
    body: [
      `You can request data export or deletion anytime by emailing 
      <a href="mailto:matheus.felipe.19rt@gmail.com" class="text-primary underline hover:text-primary/80">
        matheus.felipe.19rt@gmail.com
      </a>.`,
    ],
  },
  {
    title: "Security",
    body: [
      "Secrets are encrypted at rest. Only authorized users with access permissions can decrypt and view them via the UI.",
    ],
  },
  {
    title: "Policy Changes",
    body: [
      "We may update this policy. Continued use of SecretKeepR implies acceptance of the latest version.",
    ],
  },
]

useHead({
  title: "Privacy Policy - SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/legal/privacy" }, { rel: "icon", href: "/favicon.svg" }],
  meta: [{ name: "description", content: "Read the privacy policy for SecretKeepR." }],
})

useSeoMeta({
  title: "Privacy Policy - SecretKeepR",
  description: "Read the privacy policy for SecretKeepR.",
})
</script>
