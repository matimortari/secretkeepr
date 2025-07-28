<template>
  <div
    v-motion :initial="{ opacity: 0 }"
    :enter="{ opacity: 1 }" :transition="{ duration: 800 }"
    class="flex flex-col gap-4"
  >
    <header class="border-b pb-2">
      <h2>Organization</h2>
    </header>

    <div class="flex flex-col gap-4">
      <OrganizationDetails :org="org" />
      <OrganizationAuditLogs :logs="logs" />
      <OrganizationDangerZone :org="org" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"

const orgStore = useOrganizationStore()

const org = computed(() => orgStore.selectedOrg)
const logs = computed(() => orgStore.auditLogs.logs)

watch(() => org.value?.id, async (id) => {
  if (id)
    await orgStore.getAuditLogs(id)
}, { immediate: true })

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
