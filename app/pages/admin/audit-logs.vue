<template>
  <div>
    <h2 class="border-b py-2">
      Audit Logs
    </h2>

    <AuditLogsFilter :filters="filters" :actions="actions" :logs="logs" :user-map="userMap" />

    <p v-if="orgStore.isLoading" class="text-caption py-4">
      Loading logs…
    </p>
    <p v-else-if="!logs.length" class="text-caption py-4">
      No audit logs found.
    </p>

    <AuditLogsTable
      v-else
      :logs="logs"
      :headers="headers"
      :actions="actions"
      :filters="filters"
      :user-map="userMap"
    />
  </div>
</template>

<script setup lang="ts">
const orgStore = useOrganizationStore()
const { filters, actions, headers, logs } = useAuditLogs()

const activeOrg = computed(() => orgStore.activeOrg)
const userMap = computed(() => {
  const m = new Map<string, string>()
  activeOrg.value?.memberships?.forEach(mb => mb.user && m.set(mb.user.id, mb.user.name))
  return m
})

watch(() => activeOrg.value, async (org) => {
  if (org?.id)
    await orgStore.getAuditLogs(org.id)
}, { immediate: true })

useHead({
  title: "Audit Logs - SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/admin/audit-logs" }, { rel: "icon", href: "/favicon.svg" }],
  meta: [{ name: "description", content: "SecretKeepR audit logs page." }],
})

useSeoMeta({
  title: "Audit Logs - SecretKeepR",
  description: "SecretKeepR audit logs page.",
})

definePageMeta({
  layout: "admin",
  middleware: auth,
})
</script>
