<template>
  <div v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1 }" :duration="800">
    <h2 class="border-b py-2">
      Audit Logs
    </h2>

    <AuditFilter />

    <!-- <p v-if="orgStore.loading" class="text-caption py-4">
      Loading logs…
    </p>
    <p v-else-if="!logs.length" class="text-caption py-4">
      No audit logs found.
    </p> -->

    <!-- v-else -->
    <AuditTable />
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const auditStore = useAuditStore()

watch(() => userStore.activeOrg, async (org) => {
  if (org?.id)
    await auditStore.getAuditLogs(org.id)
}, { immediate: true })

useHead({
  title: "Audit Logs",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/admin/audit-logs" }],
  meta: [{ name: "description", content: "SecretkeepR audit logs page." }],
})

definePageMeta({
  layout: "admin",
  middleware: auth,
})
</script>
