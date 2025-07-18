<template>
  <div class="flex flex-col gap-2 border-b">
    <header class="flex flex-col items-center text-center gap-1 md:items-start md:text-start border-b pb-2">
      <h4>
        Audit Logs
      </h4>
      <p class="text-sm text-muted-foreground">
        Track changes and activities.
      </p>
    </header>

    <section class="flex flex-col md:flex-row items-center justify-between gap-2 p-2">
      <div class="flex flex-col md:flex-row items-center gap-2">
        <label class="text-sm font-medium">Filter by Date</label>
        <input v-model="dateFilter" type="date">

        <label class="text-sm font-medium">Filter by User</label>
        <select v-model="userFilter">
          <option value="">
            All Users
          </option>
          <option v-for="user in users" :key="user" :value="user">
            {{ user }}
          </option>
        </select>

        <label class="text-sm font-medium">Filter by Action</label>
        <select v-model="actionFilter">
          <option value="">
            All Actions
          </option>
          <option v-for="action in actions" :key="action.value" :value="action.value">
            {{ action.label }}
          </option>
        </select>
      </div>

      <nav class="flex flex-col md:flex-row items-center gap-2">
        <div v-if="totalPages > 0" class="flex flex-row items-center gap-4">
          <button class="btn-secondary disabled:opacity-80 w-20" :disabled="!hasPrevPage" @click="prevPage">
            <Icon name="ph:arrow-left" size="20" />
            <span>Previous</span>
          </button>
          <span class="text-sm text-muted-foreground">Page {{ page }} of {{ totalPages }}</span>
          <button class="btn-secondary disabled:opacity-80 w-20" :disabled="!hasNextPage" @click="nextPage">
            <span>Next</span>
            <Icon name="ph:arrow-right" size="20" />
          </button>
        </div>
        <span v-else class="text-sm text-muted-foreground">-</span>
      </nav>
    </section>

    <section class="py-2 w-full">
      <Spinner v-if="isLoading" />
      <div v-else-if="filteredLogs.length === 0" class="text-muted-foreground text-center my-4">
        No audit logs found.
      </div>

      <div v-else class="overflow-auto max-h-[50vh] scroll-area">
        <table class="w-full table-fixed border rounded-sm overflow-hidden">
          <thead>
            <tr class="bg-muted font-semibold text-sm">
              <th v-for="header in headers" :key="header.value" class="p-2 text-left select-none border w-1/5">
                <div class="flex flex-row items-center gap-2">
                  <Icon :name="header.icon" size="15" class="mr-1" />
                  <span>{{ header.label }}</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id" class="text-sm">
              <td class="p-2 font-medium border truncate w-1/5">
                {{ log.action }}
              </td>
              <td class="p-2 text-muted-foreground truncate border w-1/5">
                {{ log.resource }}
              </td>
              <td class="p-2 text-muted-foreground truncate border w-1/5">
                {{ formatMetadata(log.metadata) }}
              </td>
              <td class="p-2 text-muted-foreground truncate border w-1/5">
                <span>{{ log.userId }}</span>
              </td>
              <td class="p-2 text-muted-foreground truncate border w-1/5">
                {{ formatDate(log.createdAt instanceof Date ? log.createdAt.toISOString() : log.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"

const props = defineProps<{
  logs: AuditLogType[]
}>()

const headers = [
  { value: "action", label: "Action", icon: "ph:clock-bold" },
  { value: "resource", label: "Resource", icon: "ph:table-bold" },
  { value: "metadata", label: "Metadata", icon: "ph:info-bold" },
  { value: "userId", label: "User ID", icon: "ph:user-bold" },
  { value: "createdAt", label: "Timestamp", icon: "ph:calendar-bold" },
]

const actions = [
  { value: "secret.create", label: "Secret Created" },
  { value: "secret.update", label: "Secret Updated" },
  { value: "secret.delete", label: "Secret Deleted" },
  { value: "project.create", label: "Project Created" },
  { value: "project.update", label: "Project Updated" },
  { value: "project.delete", label: "Project Deleted" },
]

const { auditLogs, isLoading, totalPages, hasNextPage, hasPrevPage } = storeToRefs(useOrganizationStore())
const { nextAuditLogPage: nextPage, prevAuditLogPage: prevPage } = useOrganizationStore()

const dateFilter = ref("")
const userFilter = ref("")
const actionFilter = ref("")

onMounted(async () => {
  await useOrganizationStore().getAuditLogs()
})

const page = computed(() => auditLogs.value.page)

const users = computed(() => {
  const unique = new Set(props.logs.map(log => log.userId))
  return Array.from(unique)
})

const filteredLogs = computed(() => {
  return props.logs.filter((log) => {
    const matchesDate = dateFilter.value
      ? new Date(log.createdAt).toISOString().slice(0, 10) === dateFilter.value
      : true
    const matchesUser = userFilter.value ? log.userId === userFilter.value : true
    const matchesAction = actionFilter.value ? log.action === actionFilter.value : true
    return matchesDate && matchesUser && matchesAction
  })
})

function formatDate(iso: string | Date): string {
  return new Date(iso).toLocaleString()
}

function formatMetadata(metadata: Record<string, any>) {
  if (metadata.secretKey)
    return metadata.secretKey
  if (metadata.projectName)
    return metadata.projectName
  if (metadata.description)
    return metadata.description
  return JSON.stringify(metadata)
}
</script>
