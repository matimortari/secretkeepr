export function useAudit() {
  const auditStore = useAuditStore()
  const { auditLogs, pagination, filters, currentFilters, loading, errors } = storeToRefs(auditStore)
  const { getAuditLogs, deleteAuditLogs, getFilters, updateFilters, resetFilters, nextPage, prevPage, goToPage } = auditStore

  /**
   * Format date string for display
   */
  const formatDate = (dateString: Date | string | undefined | null): string => {
    if (!dateString)
      return "-"

    const formattedDate = new Date(dateString).toLocaleDateString("en-US", {
      year: "2-digit",
      month: "short",
      day: "numeric",
    })

    return formattedDate.charAt(0).toLowerCase() + formattedDate.slice(1)
  }

  /**
   * Format metadata object for display
   */
  const formatMetadata = (metadata: Record<string, any>): string => {
    if (!metadata || typeof metadata !== "object")
      return "-"

    const entries = Object.entries(metadata)
    if (entries.length === 0)
      return "-"

    return entries
      .map(([key, value]) => {
        if (key.toLowerCase().includes("secret") || key.toLowerCase().includes("password")) {
          return `<strong>${key}:</strong> [HIDDEN]`
        }
        return `<strong>${key}:</strong> ${value}`
      })
      .join(", ")
  }

  /**
   * Format sensitive data from metadata
   */
  const formatSensitiveData = (metadata: Record<string, any>, maxLength = 1000): string => {
    if (!metadata || typeof metadata !== "object")
      return "-"

    const entries = Object.entries(metadata)
    if (entries.length === 0)
      return "-"

    const formatted = entries
      .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
      .join(", ")

    return formatted.length > maxLength
      ? `${formatted.substring(0, maxLength)}...`
      : formatted
  }

  /**
   * Get table headers for audit logs
   */
  const getTableHeaders = () => [
    { value: "action", label: "Action", icon: "material-symbols:play-arrow" },
    { value: "resource", label: "Resource", icon: "material-symbols:category" },
    { value: "metadata", label: "Details", icon: "material-symbols:info" },
    { value: "user", label: "User", icon: "material-symbols:person" },
    { value: "createdAt", label: "Date", icon: "material-symbols:schedule" },
    { value: "sensitive", label: "Sensitive Data", icon: "material-symbols:visibility" },
  ]

  /**
   * Get available actions from filters
   */
  const getActions = computed(() => {
    if (!filters.value?.actions)
      return []
    return filters.value.actions.map(action => ({
      value: action,
      label: action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    }))
  })

  /**
   * Create user map for quick lookup
   */
  const getUserMap = computed(() => {
    const map = new Map<string, string>()
    if (filters.value?.users) {
      for (const user of filters.value.users) {
        map.set(user.id, user.name || user.email)
      }
    }
    return map
  })

  /**
   * Initialize audit data for an organization
   * Loads audit logs and filters
   */
  const initializeAudit = async (orgId: string) => {
    try {
      await Promise.all([
        getAuditLogs(orgId),
        getFilters(orgId),
      ])
    }
    catch (error) {
      console.error("Failed to initialize audit data:", error)
      throw error
    }
  }

  /**
   * Apply filters and refresh audit logs
   */
  const applyFilters = async (orgId: string, newFilters: Parameters<typeof updateFilters>[0]) => {
    updateFilters({ ...newFilters, page: 1 }) // Reset to first page when filtering
    await getAuditLogs(orgId, currentFilters.value)
  }

  /**
   * Clear all filters and refresh data
   */
  const clearFilters = async (orgId: string) => {
    resetFilters()
    await getAuditLogs(orgId, currentFilters.value)
  }

  /**
   * Delete audit logs with confirmation and refresh
   */
  const deleteLogs = async (orgId: string, deleteParams: Parameters<typeof deleteAuditLogs>[1]) => {
    const result = await deleteAuditLogs(orgId, deleteParams)
    return result
  }

  return {
    auditLogs,
    pagination,
    filters,
    currentFilters,
    loading,
    errors,
    getAuditLogs,
    deleteAuditLogs,
    getFilters,
    updateFilters,
    resetFilters,
    nextPage,
    prevPage,
    goToPage,
    initializeAudit,
    applyFilters,
    clearFilters,
    deleteLogs,
    formatDate,
    formatMetadata,
    formatSensitiveData,
    getTableHeaders,
    getActions,
    getUserMap,
  }
}
