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
        <label class="flex items-center gap-2 text-sm">
          <input v-model="showSensitiveData" type="checkbox">
          <span>Show sensitive data</span>
        </label>
      </div>

      <nav v-if="totalPages > 0" class="flex w-full flex-row items-center justify-center gap-4 md:w-auto">
        <button class="btn-secondary disabled:opacity-80" :disabled="!hasPrevPage" @click="prevPage">
          <Icon name="ph:arrow-left" size="20" />
        </button>
        <span class="whitespace-nowrap text-sm text-muted-foreground">
          Page {{ page }} of {{ totalPages }}
        </span>
        <button class="btn-secondary disabled:opacity-80" :disabled="!hasNextPage" @click="nextPage">
          <Icon name="ph:arrow-right" size="20" />
        </button>

        <button class="btn-danger" :disabled="isLoading || filteredLogs.length === 0" @click="handleDeleteLogs">
          Delete Audit Logs
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
              <th v-for="header in headers" :key="header.value" class="select-none border p-2 text-left" :style="{ width: header.width }">
                <div class="navigation-group">
                  <Icon :name="header.icon" size="15" class="mr-1" />
                  <span>{{ header.label }}</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id" class="text-sm">
              <td class="truncate border p-2 font-semibold" :title="getActionLabel(log.action)" :style="{ width: headers[0].width }">
                {{ getActionLabel(log.action) }}
              </td>
              <td class="truncate border p-2 text-muted-foreground" :title="log.resource" :style="{ width: headers[1].width }">
                {{ log.resource }}
              </td>
              <td class="truncate border p-2 text-muted-foreground" :title="formatMetadata(log.metadata ?? {})" :style="{ width: headers[2].width }">
                {{ formatMetadata(log.metadata ?? {}) }}
              </td>
              <td class="truncate border p-2 text-muted-foreground" :title="log.userId" :style="{ width: headers[3].width }">
                <span>{{ log.userId }}</span>
              </td>
              <td class="truncate border p-2 text-muted-foreground" :title="formatDate(log.createdAt)" :style="{ width: headers[4].width }">
                {{ formatDate(log.createdAt) }}
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
  { value: "action", label: "Action", icon: "ph:clock-bold", width: "10%" },
  { value: "resource", label: "Resource", icon: "ph:table-bold", width: "20%" },
  { value: "metadata", label: "Metadata", icon: "ph:info-bold", width: "35%" },
  { value: "userId", label: "User ID", icon: "ph:user-bold", width: "20%" },
  { value: "createdAt", label: "Timestamp", icon: "ph:calendar-bold", width: "15%" },
]

const actions = [
  { value: "organization.create", label: "Organization Created" },
  { value: "organization.update", label: "Organization Updated" },
  { value: "organization.invite.create", label: "Organization Invite Created" },
  { value: "organization.invite.accept", label: "Organization Invite Accepted" },
  { value: "organization.member.update", label: "Organization Member Role Updated" },
  { value: "organization.member.remove", label: "Organization Member Removed" },
  { value: "organization.member.leave", label: "Organization Member Left" },
  { value: "project.create", label: "Project Created" },
  { value: "project.update", label: "Project Updated" },
  { value: "project.delete", label: "Project Deleted" },
  { value: "project.member.add", label: "Project Member Added" },
  { value: "project.member.update", label: "Project Member Role Updated" },
  { value: "project.member.remove", label: "Project Member Removed" },
  { value: "secret.create", label: "Secret Created" },
  { value: "secret.update", label: "Secret Updated" },
  { value: "secret.delete", label: "Secret Deleted" },
]

const organizationStore = useOrganizationStore()

const { auditLogs, isLoading, totalPages, hasNextPage, hasPrevPage } = storeToRefs(organizationStore)
const nextPage = organizationStore.nextAuditLogPage
const prevPage = organizationStore.prevAuditLogPage
const dateFilter = ref("")
const userFilter = ref("")
const actionFilter = ref("")
const showSensitiveData = ref(false)

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
  }).map((log) => {
    if (!showSensitiveData.value) {
      const sanitizedMetadata = { ...log.metadata }
      delete sanitizedMetadata.ip
      delete sanitizedMetadata.userAgent
      return { ...log, metadata: sanitizedMetadata }
    }
    return log
  })
})

async function handleDeleteLogs() {
  if (!organizationStore.selectedOrganization?.id)
    return
  if (!confirm("Are you sure you want to delete all filtered audit logs? This action cannot be undone.")) {
    return
  }

  const filters = {
    organizationId: organizationStore.selectedOrganization.id,
    action: actionFilter.value || undefined,
    beforeDate: dateFilter.value || undefined,
    createdBySelfOnly: userFilter.value === "self",
    protectedActions: [],
  }

  try {
    await organizationStore.deleteAuditLogs(filters)
  }
  catch (error: any) {
    alert(`Failed to delete audit logs: ${error?.message || error}`)
  }
}

function getActionLabel(action: string): string {
  const found = actions.find(a => a.value === action)
  return found ? found.label : action
}

function formatDate(date?: string | Date): string {
  if (!date)
    return "—"

  const d = typeof date === "string" ? new Date(date) : date

  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function formatMetadata(metadata: Record<string, any>) {
  if (!metadata || Object.keys(metadata).length === 0)
    return ""

  const lines: string[] = []

  const maskSecret = (value: string) => {
    if (!value || value.length < 12)
      return value
    return `${value.slice(0, 6)}...${value.slice(-4)}`
  }

  if (metadata.secretKey) {
    lines.push(`Secret: ${metadata.secretKey}`)
  }
  if (metadata.projectName) {
    lines.push(`Project: ${metadata.projectName}`)
  }
  if (metadata.name) {
    lines.push(`Name: ${metadata.name}`)
  }
  if (metadata.description) {
    lines.push(`Description: ${metadata.description}`)
  }
  if (metadata.ip) {
    lines.push(`IP: ${metadata.ip}`)
  }
  if (metadata.userAgent) {
    lines.push(`Agent: ${metadata.userAgent}`)
  }

  if (metadata.key) {
    lines.push(`Key: ${maskSecret(metadata.key)}`)
  }

  if (Array.isArray(metadata.values)) {
    metadata.values.forEach((item: any, index: number) => {
      if (item.value && item.environment) {
        lines.push(`Val${index + 1}: ${maskSecret(item.value)} (${item.environment})`)
      }
    })
  }

  if (metadata.addedUserId) {
    lines.push(`Added User: ${metadata.addedUserId}, Role: ${metadata.addedUserRole || "N/A"}`)
  }
  if (metadata.removedUserId) {
    lines.push(`Removed User: ${metadata.removedUserId}`)
  }
  if (metadata.role) {
    lines.push(`Role: ${metadata.role}`)
  }

  if (lines.length === 0) {
    try {
      return JSON.stringify(metadata, null, 2)
    }
    catch {
      return String(metadata)
    }
  }

  return lines.join(", ")
}
</script>
