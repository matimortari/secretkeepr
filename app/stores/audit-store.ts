import type { DeleteAuditLogsInput, GetAuditLogsInput } from "#shared/schemas/audit-logs"

export const useAuditStore = defineStore("audit", () => {
  const auditLogs = ref<AuditLog[]>([])
  const pagination = ref<AuditLogsPagination | null>(null)
  const filters = ref<AuditFilters | null>(null)
  const currentFilters = ref<GetAuditLogsInput>({
    page: 1,
    limit: 20,
  })

  const loading = ref<Record<"getAuditLogs" | "deleteAuditLogs" | "getFilters", boolean>>({
    getAuditLogs: false,
    deleteAuditLogs: false,
    getFilters: false,
  })

  const errors = ref<Record<"getAuditLogs" | "deleteAuditLogs" | "getFilters", string | null>>({
    getAuditLogs: null,
    deleteAuditLogs: null,
    getFilters: null,
  })

  async function getAuditLogs(orgId: string, params?: GetAuditLogsInput) {
    loading.value.getAuditLogs = true
    errors.value.getAuditLogs = null

    try {
      const res = await auditService.getAuditLogs(orgId, params)

      auditLogs.value = res.auditLogs
      pagination.value = res.pagination
      if (params) {
        currentFilters.value = { ...currentFilters.value, ...params }
      }

      return res
    }
    catch (err: any) {
      errors.value.getAuditLogs = err?.message || "Failed to fetch audit logs"
      console.error("getAuditLogs error:", err)
      throw err
    }
    finally {
      loading.value.getAuditLogs = false
    }
  }

  async function deleteAuditLogs(orgId: string, data: DeleteAuditLogsInput) {
    loading.value.deleteAuditLogs = true
    errors.value.deleteAuditLogs = null

    try {
      const res = await auditService.deleteAuditLogs(orgId, data)

      await getAuditLogs(orgId, currentFilters.value)

      return res
    }
    catch (err: any) {
      errors.value.deleteAuditLogs = err?.message || "Failed to delete audit logs"
      console.error("deleteAuditLogs error:", err)
      throw err
    }
    finally {
      loading.value.deleteAuditLogs = false
    }
  }

  async function getFilters(orgId: string) {
    loading.value.getFilters = true
    errors.value.getFilters = null

    try {
      const res = await auditService.getAuditFilters(orgId)
      filters.value = res
      return res
    }
    catch (err: any) {
      errors.value.getFilters = err?.message || "Failed to fetch audit filters"
      console.error("getFilters error:", err)
      throw err
    }
    finally {
      loading.value.getFilters = false
    }
  }

  function updateFilters(newFilters: Partial<GetAuditLogsInput>) {
    currentFilters.value = { ...currentFilters.value, ...newFilters }
  }

  function resetFilters() {
    currentFilters.value = {
      page: 1,
      limit: 20,
    }
  }

  function nextPage(orgId: string) {
    if (pagination.value?.hasNext) {
      const nextPageParams = {
        ...currentFilters.value,
        page: currentFilters.value.page! + 1,
      }
      return getAuditLogs(orgId, nextPageParams)
    }
  }

  function prevPage(orgId: string) {
    if (pagination.value?.hasPrev) {
      const prevPageParams = {
        ...currentFilters.value,
        page: Math.max(1, currentFilters.value.page! - 1),
      }
      return getAuditLogs(orgId, prevPageParams)
    }
  }

  function goToPage(orgId: string, page: number) {
    const pageParams = {
      ...currentFilters.value,
      page,
    }
    return getAuditLogs(orgId, pageParams)
  }

  return {
    loading,
    errors,
    auditLogs,
    pagination,
    filters,
    currentFilters,
    getAuditLogs,
    deleteAuditLogs,
    getFilters,
    updateFilters,
    resetFilters,
    nextPage,
    prevPage,
    goToPage,
  }
})
