<template>
  <div
    v-motion class="min-h-screen"
    :initial="{ opacity: 0 }" :enter="{ opacity: 1 }"
    :duration="800"
  >
    <div class="flex flex-col gap-4">
      <header class="navigation-group border-b pb-2">
        <h2>
          Organization
        </h2>
      </header>

      <div class="flex flex-col gap-2">
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

const userStore = useUserStore()
const organizationStore = useOrganizationStore()

const organization = computed(() => organizationStore.selectedOrganization)
const logs = computed(() => organizationStore.auditLogs.logs)

onMounted(async () => {
  await userStore.getUser()
  if (organization.value?.id) {
    await organizationStore.getAuditLogs(organization.value.id)
  }
})

watch(() => organization.value?.id, async (newId) => {
  if (newId) {
    await organizationStore.getAuditLogs(newId)
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
