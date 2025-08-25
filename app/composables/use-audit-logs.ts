export function useAuditLogs() {
  const orgStore = useOrganizationStore()

  interface NormalizedLogType extends AuditLogType {
    actionLabel: string
    createdAtFormatted: string
    sensitiveInfo: string
    metadata: Record<string, any>
  }

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
    { label: "Action", value: "action", icon: "ph:cursor-click-bold" },
    { label: "Resource", value: "resource", icon: "ph:archive-box-bold" },
    { label: "Metadata", value: "metadata", icon: "ph:note-bold" },
    { label: "User", value: "userId", icon: "ph:user-bold" },
    { label: "Created At", value: "createdAt", icon: "ph:clock-bold" },
    { label: "Sensitive Info", value: "sensitive", icon: "ph:shield-bold" },
  ]

  const filters = ref({
    date: "",
    user: "",
    action: "",
    showSensitiveInfo: false,
  })

  function stripSensitiveData(metadata: Record<string, any>) {
    const { ip, userAgent, ...rest } = metadata
    return rest
  }

  function formatSensitiveData(metadata: Record<string, any>) {
    const ip = metadata.ip ?? "N/A"
    const agent = metadata.userAgent ?? "N/A"
    return `IP: ${ip}; Agent: ${agent}`
  }

  function formatDate(date?: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date
    return !d || Number.isNaN(d.getTime())
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
    const entries: string[] = []

    for (const [key, value] of Object.entries(safeMetadata)) {
      if (value === null || value === undefined || value === "")
        continue // skip empty values

      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (!item)
            return // skip null/undefined
          const valStr = typeof item === "object" ? JSON.stringify(item) : item
          entries.push(`${key} ${i + 1}: ${valStr}`)
        })
      }
      else if (typeof value === "object" && value !== null) {
        entries.push(`${key}: ${JSON.stringify(value)}`)
      }
      else {
        entries.push(`${key}: ${value}`)
      }
    }

    // Wrap each entry in a div with truncate so it remains one line
    return entries.map(e => `<div class="truncate max-w-full">${e}</div>`).join("")
  }

  const logs = computed<NormalizedLogType[]>(() => {
    const { date, user, action, showSensitiveInfo } = filters.value

    return (orgStore.auditLogs.logs || [])
      .filter((log: AuditLogType) => {
        const createdAtStr = log.createdAt instanceof Date
          ? log.createdAt.toISOString()
          : typeof log.createdAt === "string"
            ? log.createdAt
            : ""
        const logDate = createdAtStr.slice(0, 10)

        return (!date || logDate === date)
          && (!user || log.userId === user)
          && (!action || log.action === action)
      })
      .map((log: AuditLogType) => {
        const actionLabel = actions.find(a => a.value === log.action)?.label ?? log.action
        const createdAtFormatted = formatDate(log.createdAt)
        const sensitiveInfo = formatSensitiveData(log.metadata || {})
        const metadata = showSensitiveInfo
          ? log.metadata || {}
          : stripSensitiveData(log.metadata || {})
        return { ...log, actionLabel, createdAtFormatted, sensitiveInfo, metadata }
      })
  })

  return { filters, actions, headers, logs, formatDate, formatMetadata, formatSensitiveData }
}
