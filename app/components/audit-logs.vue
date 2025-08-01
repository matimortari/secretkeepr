<template>
  <section class="md:navigation-group flex w-full flex-col justify-between py-4 md:px-8">
    <header class="flex flex-col items-center gap-1 text-center md:items-start md:text-start">
      <h5>Audit Logs</h5>
      <p class="text-caption">
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

        <span class="text-caption whitespace-nowrap">
          {{ orgStore.auditLogs.page }} / {{ orgStore.totalPages }}
        </span>
        <button type="button" class="btn-secondary disabled:opacity-80" :disabled="!orgStore.hasNextPage" @click="orgStore.nextAuditLogPage">
          <Icon name="ph:arrow-right-bold" size="20" />
        </button>
        <button type="button" class="btn-danger" :disabled="filteredLogs.length === 0" @click="handleDeleteLogs">
          <Icon name="ph:trash-bold" size="20" />
        </button>
      </nav>
    </nav>
  </section>

  <div class="flex flex-col items-center justify-center py-4 text-center md:px-8">
    <p v-if="orgStore.isLoading" class="text-caption">
      Loading logs...
    </p>
    <p v-else-if="filteredLogs.length === 0" class="text-caption">
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
          <tr v-for="log in filteredLogs" :key="log.id" class="text-caption text-left">
            <td class="truncate border p-2 font-semibold" :title="formatAction(log.action)" :style="{ width: headers[0]?.width }">
              {{ formatAction(log.action) }}
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
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"

const orgStore = useOrganizationStore()

const {
  filters,
  headers,
  filteredLogs,
  users,
  actions,
  formatAction,
  formatDate,
  formatMetadata,
} = useAuditLogs()

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
