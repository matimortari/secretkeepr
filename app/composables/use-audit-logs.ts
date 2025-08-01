import { computed, ref } from "vue"
import { useOrganizationStore } from "~/lib/stores/organization-store"
import { useUserStore } from "~/lib/stores/user-store"

export function useAuditLogs() {
  const userStore = useUserStore()
  const orgStore = useOrganizationStore()

  const filters = ref({
    date: "",
    user: "",
    action: "",
    showSensitiveData: false,
  })

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

  // Use logs directly from the store
  const logs = computed(() => orgStore.auditLogs.logs || [])

  const users = computed(() =>
    [...new Set(logs.value.map(log => log.userId))].sort((a, b) => a.localeCompare(b)),
  )

  const filteredLogs = computed(() => {
    const { date, user, action, showSensitiveData } = filters.value

    return logs.value
      .filter((log) => {
        const logDate = log.createdAt ? new Date(log.createdAt).toISOString().slice(0, 10) : ""
        const dateMatch = !date || logDate === date
        const userMatch = !user || (user === "self" ? log.userId === userStore.user?.id : log.userId === user)
        const actionMatch = !action || log.action === action
        return dateMatch && userMatch && actionMatch
      })
      .map((log) => {
        if (showSensitiveData)
          return log
        const { ip, userAgent, ...metadata } = log.metadata || {}
        return { ...log, metadata }
      })
  })

  function formatAction(action: string) {
    return actions.find(a => a.value === action)?.label || action
  }

  function formatDate(date?: string | Date): string {
    const d = new Date(date ?? "")
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleString("en-US", {
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

    const staticFields = [
      ["secretKey", "Secret"],
      ["projectName", "Project"],
      ["name", "Name"],
      ["description", "Description"],
      ["ip", "IP"],
      ["userAgent", "Agent"],
      ["key", "Key"],
      ["addedUserId", "Added User"],
      ["removedUserId", "Removed User"],
      ["role", "Role"],
    ]

    const entries: string[] = []
    for (const [key, label] of staticFields) {
      if (key && metadata[key] !== undefined) {
        if (key === "addedUserId") {
          entries.push(`${label}: ${metadata[key]}, Role: ${metadata.role}`)
        }
        else {
          entries.push(`${label}: ${metadata[key]}`)
        }
      }
    }

    if (Array.isArray(metadata.values)) {
      metadata.values.forEach((item: any, i: number) => {
        if (item?.value && item?.environment) {
          entries.push(`Value ${i + 1}: ${item.value} (${item.environment})`)
        }
      })
    }

    return entries.length ? entries.join("; ") : JSON.stringify(metadata)
  }

  return { filters, filteredLogs, users, actions, headers, formatAction, formatDate, formatMetadata }
}
