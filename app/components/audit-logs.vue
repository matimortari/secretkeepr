<template>
  <section class="flex flex-col items-start justify-between gap-2 border-b p-2">
    <header class="flex flex-col items-start gap-1 text-start">
      <h4>
        Audit Logs
      </h4>
      <p class="text-info">
        Track changes and activities.
      </p>
    </header>

    <nav class="navigation-group">
      <input v-model="filters.date" type="date">

      <select v-model="filters.user">
        <option value="">
          All Users
        </option>
        <option value="self">
          Self
        </option>
        <option v-for="user in users" :key="user" :value="user">
          {{ user }}
        </option>
      </select>

      <select v-model="filters.action">
        <option value="">
          All Actions
        </option>
        <option v-for="action in actions" :key="action.value" :value="action.value">
          {{ action.label }}
        </option>
      </select>

      <label class="navigation-group justify-center whitespace-nowrap text-xs">
        <input
          v-model="filters.showSensitiveData"
          type="checkbox"
          class="appearance-none rounded border border-muted bg-transparent p-2 checked:bg-secondary focus:outline-none"
        >
        <span>Show sensitive data</span>
      </label>

      <nav v-if="orgStore.totalPages > 0" class="navigation-group w-full justify-around">
        <button type="button" class="btn-secondary disabled:opacity-80" :disabled="!orgStore.hasPrevPage" @click="orgStore.prevAuditLogPage">
          <Icon name="ph:arrow-left-bold" size="20" />
        </button>

        <span class="text-info whitespace-nowrap">
          {{ orgStore.auditLogs.page }} / {{ orgStore.totalPages }}
        </span>
        <button type="button" class="btn-secondary disabled:opacity-80" :disabled="!orgStore.hasNextPage" @click="orgStore.nextAuditLogPage">
          <Icon name="ph:arrow-right-bold" size="20" />
        </button>
        <button type="button" class="btn-danger" :disabled="!logs.length" @click="handleDeleteLogs">
          <Icon name="ph:trash-bold" size="20" />
        </button>
      </nav>
    </nav>

    <p v-if="orgStore.isLoading" class="text-info">
      Loading logs...
    </p>
    <p v-else-if="!logs.length" class="text-info">
      No audit logs found.
    </p>

    <div v-else class="scroll-area max-h-[50vh] w-full overflow-x-auto">
      <table class="table-fixed rounded-sm md:w-full">
        <thead>
          <tr class="bg-muted text-sm font-semibold">
            <th v-for="header in headers" :key="header.value" class="w-full border-x p-2 text-left" :style="{ width: header.width }">
              <div class="navigation-group">
                <Icon :name="header.icon" size="20" />
                <span>{{ header.label }}</span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="log in logs" :key="log.id" class="text-info text-left">
            <td class="truncate border p-2 font-semibold" :title="actions.find(a => a.value === log.action)?.label" :style="{ width: headers[0]?.width }">
              {{ actions.find(a => a.value === log.action)?.label }}
            </td>
            <td class="truncate border p-2" :title="log.resource" :style="{ width: headers[1]?.width }">
              {{ log.resource }}
            </td>
            <td class="truncate border p-2" :title="formatMetadata(log.metadata ?? {})" :style="{ width: headers[2]?.width }">
              {{ formatMetadata(log.metadata ?? {}) }}
            </td>
            <td class="truncate border p-2" :title="log.userId" :style="{ width: headers[3]?.width }">
              <span>{{ log.userId }}</span>
            </td>
            <td class="truncate border p-2" :title="formatDate(log.createdAt)" :style="{ width: headers[4]?.width }">
              {{ formatDate(log.createdAt) }}
            </td>
            <td class="truncate border p-2" :title="filters.showSensitiveData ? formatSensitiveData(log.metadata ?? {}) : ''" :style="{ width: headers[5]?.width }">
              <span v-if="filters.showSensitiveData">
                {{ formatSensitiveData(log.metadata ?? {}) }}
              </span>
              <span v-else class="text-muted">Hidden</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"

const orgStore = useOrganizationStore()
const { filters, actions, headers, logs, formatDate, formatMetadata, formatSensitiveData } = useAuditLogs()

const users = computed(() =>
  [...new Set(orgStore.auditLogs.logs.map(log => log.userId))].sort((a, b) => a.localeCompare(b)),
)

async function handleDeleteLogs() {
  if (!orgStore.activeOrg?.id)
    return
  if (!confirm("Are you sure you want to delete all filtered audit logs? This action cannot be undone."))
    return

  const deleteFilters = {
    orgId: orgStore.activeOrg.id,
    action: filters.value.action || undefined,
    beforeDate: filters.value.date || undefined,
    createdBySelfOnly: filters.value.user === "self",
    protectedActions: [],
  }

  try {
    await orgStore.deleteAuditLogs(deleteFilters)
  }
  catch (error: any) {
    console.error("Failed to delete audit logs:", error)
  }
}

onMounted(async () => {
  if (orgStore.activeOrg?.id) {
    await orgStore.getAuditLogs(orgStore.activeOrg.id)
  }
})
</script>
