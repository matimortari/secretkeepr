import type { DeleteAuditLogsInput, GetAuditLogsInput } from "#shared/schemas/audit-logs"

const API_BASE = "/api/org"

export const auditService = {
  /**
   * Get audit logs with filtering and pagination
   * @param orgId Organization ID
   * @param params Query parameters for filtering and pagination
   */
  getAuditLogs: async (orgId: string, params?: GetAuditLogsInput): Promise<AuditLogsResponse> => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }

    const queryString = queryParams.toString()
    const url = `${API_BASE}/${orgId}/audit${queryString ? `?${queryString}` : ""}`

    const response = await $fetch<AuditLogsResponse>(url, {
      credentials: "include",
    })
    return response
  },

  /**
   * Delete audit logs with filtering
   * @param orgId Organization ID
   * @param data Filter criteria for deletion
   */
  deleteAuditLogs: async (orgId: string, data: DeleteAuditLogsInput) => {
    const response = await $fetch(`${API_BASE}/${orgId}/audit`, {
      method: "DELETE",
      body: data,
      credentials: "include",
    })
    return response
  },

  /**
   * Get available filter options for audit logs
   * @param orgId Organization ID
   */
  getAuditFilters: async (orgId: string): Promise<AuditFilters> => {
    const response = await $fetch<AuditFilters>(`${API_BASE}/${orgId}/audit/filters`, {
      credentials: "include",
    })
    return response
  },
}
