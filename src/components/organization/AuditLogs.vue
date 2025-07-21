<template>
  <div class="flex flex-col gap-2 border-b">
    <header class="flex flex-col items-center gap-1 border-b pb-2 text-center md:items-start md:text-start">
      <h4>
        Audit Logs
      </h4>
      <p class="text-sm text-muted-foreground">
        Track changes and activities.
      </p>
    </header>

    <section class="md:navigation-group flex flex-col p-2 md:justify-between">
      <div class="md:navigation-group flex w-full flex-col md:w-auto">
        <label class="flex w-full flex-col gap-2 text-sm font-medium md:w-auto">
          <span>Filter by Date</span>
          <input v-model="dateFilter" type="date" class="w-full md:w-auto">
        </label>
        <label class="flex w-full flex-col gap-2 text-sm font-medium md:w-auto">
          <span>Filter by User</span>
          <select v-model="userFilter" class="w-full md:w-auto">
            <option value="">All Users</option>
            <option v-for="user in users" :key="user" :value="user">{{ user }}</option>
          </select>
        </label>
        <label class="flex w-full flex-col gap-2 text-sm font-medium md:w-auto">
          <span>Filter by Action</span>
          <select v-model="actionFilter" class="w-full md:w-auto">
            <option value="">All Actions</option>
            <option v-for="action in actions" :key="action.value" :value="action.value">
              {{ action.label }}
            </option>
          </select>
        </label>
      </div>

      <nav v-if="totalPages > 0" class="flex w-full flex-row items-center justify-center gap-4 md:mt-8 md:w-auto">
        <button class="btn-secondary disabled:opacity-80" :disabled="!hasPrevPage" @click="prevPage">
          <Icon name="ph:arrow-left" size="20" />
        </button>
        <span class="whitespace-nowrap text-sm text-muted-foreground">
          Page {{ page }} of {{ totalPages }}
        </span>
        <button class="btn-secondary disabled:opacity-80" :disabled="!hasNextPage" @click="nextPage">
          <Icon name="ph:arrow-right" size="20" />
        </button>
      </nav>
    </section>

    <section class="w-full py-2">
      <Spinner v-if="isLoading" />
      <div v-else-if="filteredLogs.length === 0" class="my-4 text-center text-muted-foreground">
        No audit logs found.
      </div>

      <div v-else class="scroll-area max-h-[50vh] w-full overflow-auto">
        <table class="table-fixed rounded-sm border md:w-full md:overflow-hidden">
          <thead>
            <tr class="bg-muted text-sm font-semibold transition-all duration-500">
              <th v-for="header in headers" :key="header.value" class="select-none border p-2 text-left md:w-1/5">
                <div class="navigation-group">
                  <Icon :name="header.icon" size="15" class="mr-1" />
                  <span>{{ header.label }}</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id" class="text-sm">
              <td class="truncate border p-2 font-semibold md:w-1/5">
                {{ getActionLabel(log.action) }}
              </td>
              <td class="truncate border p-2 text-muted-foreground md:w-1/5">
                {{ log.resource }}
              </td>
              <td class="truncate border p-2 text-muted-foreground md:w-1/5">
                {{ formatMetadata(log.metadata ?? {}) }}
              </td>
              <td class="truncate border p-2 text-muted-foreground md:w-1/5">
                <span>{{ log.userId }}</span>
              </td>
              <td class="truncate border p-2 text-muted-foreground md:w-1/5">
                {{ log.createdAt }}
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
  { value: "project.member.add", label: "Project Member Added" },
  { value: "project.member.remove", label: "Project Member Removed" },
  { value: "organization.update", label: "Organization Updated" },
  { value: "organization.member.leave", label: "Organization Member Left" },
  { value: "organization.member.remove", label: "Organization Member Removed" },
  { value: "organization.member.role.update", label: "Organization Member Role Updated" },
]

const organizationStore = useOrganizationStore()

const { auditLogs, isLoading, totalPages, hasNextPage, hasPrevPage } = storeToRefs(organizationStore)
const nextPage = organizationStore.nextAuditLogPage
const prevPage = organizationStore.prevAuditLogPage
const dateFilter = ref("")
const userFilter = ref("")
const actionFilter = ref("")

onMounted(async () => {
  if (organizationStore.selectedOrganization?.id) {
    await organizationStore.getAuditLogs(organizationStore.selectedOrganization.id)
  }
})

const page = computed(() => auditLogs.value.page)

const users = computed(() => {
  const unique = new Set(props.logs.map(log => log.userId))
  return Array.from(unique)
})

const filteredLogs = computed(() => {
  return props.logs.filter((log) => {
    const matchesDate = dateFilter.value
      ? log.createdAt && new Date(log.createdAt).toISOString().slice(0, 10) === dateFilter.value
      : true
    const matchesUser = userFilter.value ? log.userId === userFilter.value : true
    const matchesAction = actionFilter.value ? log.action === actionFilter.value : true
    return matchesDate && matchesUser && matchesAction
  })
})

function getActionLabel(action: string): string {
  const found = actions.find(a => a.value === action)
  return found ? found.label : action
}

function formatMetadata(metadata: Record<string, any>) {
  if (!metadata)
    return ""

  if (metadata.secretKey)
    return `Secret: ${metadata.secretKey}`
  if (metadata.projectName)
    return `Project: ${metadata.projectName}`
  if (metadata.description)
    return `Description: ${metadata.description}`
  if (metadata.addedUserId)
    return `Added User: ${metadata.addedUserId}, Role: ${metadata.addedUserRole}`
  if (metadata.removedUserId)
    return `Removed User: ${metadata.removedUserId}`
  if (metadata.role)
    return `Role: ${metadata.role}`

  return JSON.stringify(metadata)
}
</script>
