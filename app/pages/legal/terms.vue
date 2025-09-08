<template>
  <header class="flex flex-col items-start gap-2 border-b p-8 pt-24 text-start">
    <h2 class="font-display">
      Terms of Service
    </h2>
    <p class="text-muted-foreground">
      Review the rules and terms for using SecretKeepR.
    </p>
  </header>

  <div class="mx-auto flex w-full flex-row justify-between gap-8 px-8 py-4 md:px-24">
    <article
      v-motion class="flex flex-col gap-4 p-4 text-left"
      :initial="{ opacity: 0 }" :visible="{ opacity: 1 }"
      :duration="800"
    >
      <p class="text-lg">
        <span class="font-semibold">Effective Date:</span> September 8, 2025
      </p>

      <section v-for="(section, index) in termsContent" :key="index">
        <h3>
          {{ index + 1 }}. {{ section.title }}
        </h3>

        <p v-for="(para, i) in section.body" :key="`para-${i}`" class="text-muted-foreground" v-html="para" />
        <ul class="text-muted-foreground list-disc">
          <li v-for="(item, i) in section.list" :key="`li-${index}-${i}`">
            {{ item }}
          </li>
        </ul>
      </section>
    </article>

    <aside class="bg-card sticky top-24 hidden w-72 rounded-lg p-4 text-right shadow-2xl lg:block">
      <nav class="space-y-4">
        <h3 class="border-b py-4">
          On this page
        </h3>
        <ul class="text-muted-foreground space-y-2">
          <li v-for="(section, index) in termsContent" :key="`toc-${index}`">
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
const termsContent = [
  {
    title: "Introduction",
    body: [
      "Welcome to SecretKeepR! By accessing or using our service, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use SecretKeepR.",
      "In these Terms, “we”, “us”, and “our” refer to SecretKeepR and its affiliates, and “you” and “your” refer to users of our service. These Terms govern your access to and use of SecretKeepR, including all features, websites, and applications.",
    ],
  },
  {
    title: "Use of Service & Data",
    body: [
      "SecretKeepR helps users and organizations securely manage, store, and share environment variables and secrets. You agree not to misuse the service or engage in prohibited activities. You retain ownership of any secrets or data you create or upload, while granting SecretKeepR a limited license to host, store, and transmit such data solely for service purposes. SecretKeepR collects usage analytics and authentication data to operate the platform; see our Privacy Policy for details.",
    ],
    list: [
      "Do not upload or store illegal, harmful, or malicious content.",
      "Do not attempt to access secrets or projects you are not authorized to view.",
      "Do not use SecretKeepR for phishing, spamming, or distributing malware.",
      "Follow organization roles and access controls; do not bypass permissions.",
    ],
  },
  {
    title: "Disclaimers & Termination",
    body: [
      "SecretKeepR is provided on an \"as-is\" basis. We do not guarantee uninterrupted access, error-free performance, or the absolute security of your data. We may suspend or terminate your account if you violate these Terms, misuse the service, or engage in harmful activity. You may also delete your account at any time.",
      "Accounts may be suspended or terminated in cases including, but not limited to:",
    ],
    list: [
      "Violating these Terms or applicable laws.",
      "Uploading content that is illegal, harmful, or infringes third-party rights.",
      "Attempting to hack, exploit, or disrupt the platform or other users' projects.",
      "Bypassing or abusing role-based access controls.",
      "Spamming or sending unsolicited communications through SecretKeepR.",
    ],
  },
  {
    title: "Governing Law",
    body: [
      "These Terms are governed by the laws of the jurisdiction where SecretKeepR operates. Any disputes will be resolved in the competent courts of that jurisdiction.",
    ],
  },
  {
    title: "Changes to Terms",
    body: [
      "We may update these Terms from time to time. Continued use of SecretKeepR constitutes acceptance of the updated Terms. We encourage you to review the Terms periodically.",
    ],
  },
  {
    title: "Contact",
    body: [
      `If you have any questions about the Terms of Service, email the maintainer at 
      <a href="mailto:matheus.felipe.19rt@gmail.com" class='text-primary hover:underline'>
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
