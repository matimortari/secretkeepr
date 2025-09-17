<template>
  <header class="bg-card sticky top-0 z-30 border-b px-12 py-4">
    <div class="flex flex-row items-center gap-4">
      <nuxt-link to="/" aria-label="Go back" class="hover:text-primary transition-colors">
        <icon name="mdi:arrow-left" size="30" />
      </nuxt-link>
      <h2>
        Privacy Policy
      </h2>
    </div>
    <p class="text-muted-foreground">
      Learn how SecretKeepR collects, uses, and protects your data.
    </p>
  </header>

  <div class="mx-auto flex w-full flex-row justify-between px-8 md:pr-12 md:pl-32">
    <article
      v-motion class="flex flex-col gap-4 p-8 text-start md:px-16"
      :initial="{ opacity: 0 }" :visible="{ opacity: 1 }"
      :duration="800"
    >
      <p class="text-lg">
        <span class="font-semibold">Effective Date:</span> September 8, 2025
      </p>

      <section v-for="(section, index) in privacyContent" :key="index">
        <h3 :id="section.title.toLowerCase().replace(/\s+/g, '-')">
          {{ index + 1 }}. {{ section.title }}
        </h3>

        <p v-for="(para, i) in section.body" :key="`para-${i}`" class="text-muted-foreground" v-html="para" />
        <ul v-if="section.list" class="text-muted-foreground list-disc space-y-1 pl-6">
          <li v-for="(item, i) in section.list" :key="`li-${index}-${i}`">
            {{ item }}
          </li>
        </ul>
      </section>
    </article>

    <aside class="sticky top-24 hidden w-72 min-w-72 self-start rounded-b-lg p-4 text-right md:block">
      <nav class="my-8 space-y-4">
        <h4 class="border-b py-4">
          On this page
        </h4>
        <ul class="text-muted-foreground space-y-2">
          <li v-for="(section, index) in privacyContent" :key="`toc-${index}`">
            <a :href="`#${section.title?.toLowerCase().replace(/\s+/g, '-')}`" class="hover:text-primary block transition-colors">
              {{ index + 1 }}. {{ section.title }}
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
const privacyContent = [
  {
    title: "Introduction",
    body: [
      "This Privacy Policy explains how SecretKeepR collects, uses, and protects your personal information when you access or use our services, including web applications and command-line tools.",
      "In this Policy, “we”, “us”, and “our” refer to SecretKeepR and its affiliates, and “you” and “your” refer to users of our services.",
    ],
  },
  {
    title: "Information We Collect",
    body: [
      "We collect information to provide, secure, and improve our services, including:",
    ],
    list: [
      "Account information from OAuth providers (Google, GitHub, GitLab).",
      "Secrets and configuration data you create, store, or share within projects.",
      "Usage analytics such as feature interactions, page visits, and CLI commands.",
      "Technical data including device type, browser, IP address, and cookies.",
    ],
  },
  {
    title: "How We Use Your Information",
    body: [
      "We use the information we collect to:",
    ],
    list: [
      "Provide, maintain, and enhance the service.",
      "Authenticate users and enforce access controls.",
      "Analyze usage patterns and generate analytics for projects and organizations.",
      "Communicate important updates, including security alerts and policy changes.",
      "Ensure compliance with legal obligations and protect platform integrity.",
    ],
  },
  {
    title: "Sharing and Disclosure",
    body: [
      "We do not sell your personal information. We may share data under the following circumstances:",
    ],
    list: [
      "With service providers that help us operate or secure the platform.",
      "When required by law, legal process, or governmental request.",
      "To protect the rights, safety, or property of SecretKeepR, its users, or third parties.",
      "During mergers, acquisitions, or other corporate transactions, while keeping user data secure.",
    ],
  },
  {
    title: "Cookies and Tracking",
    body: [
      "SecretKeepR uses cookies and similar technologies to enhance security, improve your experience, and measure usage.",
    ],
    list: [
      "Essential cookies for authentication and security.",
      "Analytics cookies to monitor platform usage and feature adoption.",
      "Optional cookies for personalizing preferences and improving service.",
    ],
  },
  {
    title: "Data Retention and Security",
    body: [
      "We retain personal and organizational data only as long as necessary to provide our services or comply with legal obligations. Secrets are encrypted at rest, and we implement strong technical and organizational measures to protect data from unauthorized access, disclosure, or misuse.",
    ],
  },
  {
    title: "Your Rights",
    body: [
      "Depending on your jurisdiction, you may have rights regarding your personal data, including:",
    ],
    list: [
      "Accessing or correcting your personal information.",
      "Requesting deletion of your personal information or organizational data you control.",
      "Objecting to or restricting certain processing activities.",
      "Withdrawing consent where applicable.",
    ],
  },
  {
    title: "Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Continued use of SecretKeepR constitutes acceptance of the updated policy. We encourage you to review this page periodically.",
    ],
  },
  {
    title: "Contact",
    body: [
      `If you have any questions about the Privacy Policy, email the maintainer at 
      <a href="mailto:matheus.felipe.19rt@gmail.com" class='text-primary hover:underline'>
        matheus.felipe.19rt@gmail.com
      </a>.`,
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
