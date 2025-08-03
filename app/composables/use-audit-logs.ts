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

  const headers = [
    { label: "Action", value: "action", icon: "ph:cursor-click-bold", width: "10%" },
    { label: "Resource", value: "resource", icon: "ph:archive-box-bold", width: "20%" },
    { label: "Metadata", value: "metadata", icon: "ph:note-bold", width: "30%" },
    { label: "User ID", value: "userId", icon: "ph:user-bold", width: "10%" },
    { label: "Created At", value: "createdAt", icon: "ph:clock-bold", width: "15%" },
    { label: "Sensitive Info", value: "sensitive", icon: "ph:shield-bold", width: "15%" },
  ]

  const logs = computed(() => {
    const { date, user, action, showSensitiveData } = filters.value

    return (orgStore.auditLogs.logs || [])
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
    if (!metadata || typeof metadata !== "object")
      return ""

    const { ip, userAgent, ...safeMetadata } = metadata

    const staticFields = [
      ["secretKey", "Secret"],
      ["projectName", "Project"],
      ["name", "Name"],
      ["description", "Description"],
      ["key", "Key"],
      ["addedUserId", "Added User"],
      ["removedUserId", "Removed User"],
      ["role", "Role"],
    ]

    const entries: string[] = []
    for (const [key, label] of staticFields) {
      if (key && safeMetadata[key] !== undefined) {
        if (key === "addedUserId") {
          entries.push(`${label}: ${safeMetadata[key]}, Role: ${safeMetadata.role}`)
        }
        else {
          entries.push(`${label}: ${safeMetadata[key]}`)
        }
      }
    }

    if (Array.isArray(safeMetadata.values)) {
      safeMetadata.values.forEach((item: any, i: number) => {
        if (item?.value && item?.environment) {
          entries.push(`Value ${i + 1}: ${item.value} (${item.environment})`)
        }
      })
    }

    return entries.length ? entries.join("; ") : JSON.stringify(safeMetadata)
  }

  function formatSensitiveData(metadata: Record<string, any>) {
    const ip = metadata.ip ?? "N/A"
    const agent = metadata.userAgent ?? "N/A"
    return `IP: ${ip}; Agent: ${agent}`
  }

  return { filters, actions, headers, logs, formatDate, formatMetadata, formatSensitiveData }
}
