<template>
  <section class="md:navigation-group flex w-full flex-col justify-between px-8 py-4">
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

      <nav v-if="orgStore.totalPages > 0" class="navigation-group w-full justify-around md:w-auto">
        <button type="button" class="btn-secondary disabled:opacity-80" :disabled="!orgStore.hasPrevPage" @click="orgStore.prevAuditLogPage">
          <Icon name="ph:arrow-left-bold" size="20" />
        </button>

        <span class="text-caption whitespace-nowrap">
          {{ page }} / {{ orgStore.totalPages }}
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

  <div class="flex flex-col items-center justify-center px-8">
    <p v-if="orgStore.isLoading" class="text-caption w-full text-center">
      Loading logs...
    </p>
    <p v-else-if="filteredLogs.length === 0" class="text-caption w-full text-center">
      No audit logs found.
    </p>

    <div v-else class="scroll-area max-h-[50vh] w-full overflow-auto">
      <table class="table-fixed rounded-sm border md:w-full md:overflow-hidden">
        <thead>
          <tr class="border bg-muted text-sm font-semibold transition-all">
            <th v-for="header in headers" :key="header.value" class="w-full border p-2" :style="{ width: header.width }">
              <div class="navigation-group">
                <Icon :name="header.icon" size="20" />
                <span>{{ header.label }}</span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="log in filteredLogs" :key="log.id" class="text-caption">
            <td class="truncate border p-2 font-semibold" :title="formatAction(log.action)" :style="{ width: headers[0].width }">
              {{ formatAction(log.action) }}
            </td>
            <td class="truncate border p-2" :title="log.resource" :style="{ width: headers[1].width }">
              {{ log.resource }}
            </td>
            <td class="truncate border p-2" :title="formatMetadata(log.metadata ?? {})" :style="{ width: headers[2].width }">
              {{ formatMetadata(log.metadata ?? {}) }}
            </td>
            <td class="truncate border p-2" :title="log.userId" :style="{ width: headers[3].width }">
              <span>{{ log.userId }}</span>
            </td>
            <td class="truncate border p-2" :title="formatDate(log.createdAt)" :style="{ width: headers[4].width }">
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
import { useUserStore } from "~/lib/stores/user-store"

const props = defineProps<{
  logs: AuditLogType[]
}>()

const orgStore = useOrganizationStore()
const userStore = useUserStore()

const filters = ref({
  date: "",
  user: "",
  action: "",
  showSensitiveData: false,
})

const page = computed(() => orgStore.auditLogs.page)

const headers = [
  { value: "action", label: "Action", icon: "ph:clock-bold", width: "10%" },
  { value: "resource", label: "Resource", icon: "ph:table-bold", width: "20%" },
  { value: "metadata", label: "Metadata", icon: "ph:info-bold", width: "35%" },
  { value: "userId", label: "User ID", icon: "ph:user-bold", width: "20%" },
  { value: "createdAt", label: "Timestamp", icon: "ph:calendar-bold", width: "15%" },
]

const actions = [
  { value: "org.create", label: "Organization Created" },
  { value: "org.update", label: "Organization Updated" },
  { value: "org.invite.create", label: "Organization Invite Created" },
  { value: "org.invite.accept", label: "Organization Invite Accepted" },
  { value: "org.member.update", label: "Organization Member Role Updated" },
  { value: "org.member.remove", label: "Organization Member Removed" },
  { value: "org.member.leave", label: "Organization Member Left" },
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

const users = computed(() => [...new Set(props.logs.map(log => log.userId))].sort((a, b) => a.localeCompare(b)))

const filteredLogs = computed(() => {
  return props.logs
    .filter((log) => {
      const dateMatch = !filters.value.date || (log.createdAt && new Date(log.createdAt).toISOString().slice(0, 10) === filters.value.date)
      const userMatch = !filters.value.user || (filters.value.user === "self" ? log.userId === userStore.user?.id : log.userId === filters.value.user)
      const actionMatch = !filters.value.action || log.action === filters.value.action
      return dateMatch && userMatch && actionMatch
    })
    .map((log) => {
      if (!filters.value.showSensitiveData) {
        const { ip, userAgent, ...rest } = log.metadata || {}
        return { ...log, metadata: rest }
      }
      return log
    })
})

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

const formatAction = (action: string) => actions.find(a => a.value === action)?.label || action

function formatDate(date?: string | Date): string {
  if (!date)
    return ""
  const d = new Date(date)
  if (Number.isNaN(d.getTime()))
    return ""
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

  const maskSecret = (value: string) =>
    !value || value.length < 12 ? value : `${value.slice(0, 6)}...${value.slice(-4)}`

  const entries = [
    metadata.secretKey && `Secret: ${metadata.secretKey}`,
    metadata.projectName && `Project: ${metadata.projectName}`,
    metadata.name && `Name: ${metadata.name}`,
    metadata.description && `Description: ${metadata.description}`,
    metadata.ip && `IP: ${metadata.ip}`,
    metadata.userAgent && `Agent: ${metadata.userAgent}`,
    metadata.key && `Key: ${maskSecret(metadata.key)}`,
    ...(Array.isArray(metadata.values)
      ? metadata.values.map(
          (item: any, i: number) =>
            item.value && item.environment && `Value ${i + 1}: ${maskSecret(item.value)} (${item.environment})`,
        )
      : []),
    metadata.addedUserId && `Added User: ${metadata.addedUserId}, Role: ${metadata.addedUserRole || "N/A"}`,
    metadata.removedUserId && `Removed User: ${metadata.removedUserId}`,
    metadata.role && `Role: ${metadata.role}`,
  ].filter(Boolean)

  if (entries.length === 0) {
    try {
      return JSON.stringify(metadata, null, 2)
    }
    catch {
      return String(metadata)
    }
  }
  return entries.join("; ")
}

onMounted(async () => {
  if (orgStore.activeOrg?.id) {
    await orgStore.getAuditLogs(orgStore.activeOrg.id)
  }
})
</script>
