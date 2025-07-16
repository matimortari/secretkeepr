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

    <section class="py-2">
      <Spinner v-if="isLoading" />
      <div v-else-if="filteredLogs.length === 0" class="text-muted-foreground text-center my-4">
        No audit logs found.
      </div>

      <ul v-else class="grid grid-cols-1 md:grid-cols-3 gap-2 overflow-y-auto max-h-[50vh] scroll-area">
        <li v-for="log in filteredLogs" :key="log.id" class="card">
          <p class="font-semibold">
            {{ log.action }}
          </p>
          <p class="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>{{ formatMetadata(log.metadata) }}</span>
            <span>{{ log.resource }}</span>
          </p>
          <p class="flex flex-row items-center justify-between text-sm text-muted-foreground">
            <span>User: {{ log.userId }}</span>
            <span>{{ formatDate(log.createdAt instanceof Date ? log.createdAt.toISOString() : log.createdAt) }}</span>
          </p>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useOrganizationStore } from "~/lib/stores/organization-store"

const props = defineProps<{
  logs: AuditLogType[]
}>()

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
