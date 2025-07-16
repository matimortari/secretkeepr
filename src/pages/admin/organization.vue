<template>
  <div v-motion class="min-h-screen" :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <div class="flex flex-col gap-4">
      <header v-motion class="flex flex-row items-center gap-4 border-b pb-2" :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }" :duration="800" :delay="200">
        <h2>
          Organization
        </h2>
      </header>

      <div v-motion class="flex flex-col gap-8" :initial="{ opacity: 0, x: -20 }" :enter="{ opacity: 1, x: 0 }" :duration="800" :delay="200">
        <OrganizationDetails :organization="organization" />
        <OrganizationAuditLogs :logs="logs" />
        <OrganizationDangerZone :organization="organization" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"

const organization = computed(() => useOrganizationStore().selectedOrganization)
const logs = computed(() => useOrganizationStore().auditLogs.logs)

onMounted(async () => {
  await useUserStore().getUser()
  if (organization.value?.id) {
    await useOrganizationStore().getAuditLogs()
  }
})

useHead({
  title: "Organization – SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/admin/organization" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use." }],
})

useSeoMeta({
  title: "Organization – SecretKeepR",
  description: "Centralize, encrypt, and share your secrets with confidence. Fast, safe, and easy to use.",
})

definePageMeta({
  layout: "admin",
  auth: {
    unauthenticatedOnly: false,
    navigateUnauthenticatedTo: "/sign-in",
  },
})
</script>
