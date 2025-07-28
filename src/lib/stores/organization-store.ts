import {
  acceptOrgInviteService,
  createOrgInviteService,
  createOrgService,
  deleteAuditLogsService,
  deleteOrgService,
  getAuditLogsService,
  removeUserFromOrgService,
  updateOrgMemberService,
  updateOrgService,
} from "~/lib/services/organization-service"

export const useOrganizationStore = defineStore("organization", {
  state: () => ({
    orgs: [] as OrganizationType[],
    selectedOrg: null as OrganizationType | null,
    members: [] as UserOrgMembershipType[],
    inviteLink: null as string | null,
    auditLogs: {
      logs: [] as AuditLogType[],
      page: 1,
      limit: 15,
      total: 0,
      error: null as string | null,
    },
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    totalPages(state): number {
      return Math.ceil(state.auditLogs.total / state.auditLogs.limit)
    },
    hasNextPage(state): boolean {
      return state.auditLogs.page < this.totalPages
    },
    hasPrevPage(state): boolean {
      return state.auditLogs.page > 1
    },
  },

  actions: {
    requireOrgId(orgId: string) {
      if (!orgId) {
        const error = "Organization ID is required"
        this.error = error
        throw new Error(error)
      }
    },

    requireOrgName(name?: string) {
      if (!name || typeof name !== "string") {
        const error = "Organization name is required"
        this.error = error
        throw new Error(error)
      }
    },

    requireMemberInfo(memberId?: string, role?: Role, orgId?: string) {
      if (!memberId || !role || !orgId) {
        const error = "Member ID, role, and organization ID are required"
        this.error = error
        throw new Error(error)
      }
    },

    requireMemberAndOrg(memberId?: string, orgId?: string) {
      if (!memberId || !orgId) {
        const error = "Member ID and organization ID are required"
        this.error = error
        throw new Error(error)
      }
    },

    setSelectedOrg(orgId: string) {
      const found = this.orgs.find(org => org.id === orgId)
      if (found) {
        this.selectedOrg = found
        localStorage.setItem("active_org_id", orgId)
      }
    },

    getSelectedOrg() {
      const id = localStorage.getItem("active_org_id")
      if (id) {
        const org = this.orgs.find(o => o.id === id)
        if (org)
          this.selectedOrg = org
      }
    },

    async createOrg(payload: CreateOrgPayload) {
      this.requireOrgName(payload.name)
      this.isLoading = true
      this.error = null

      try {
        const response = await createOrgService(payload)
        this.orgs.push(response.newOrg)
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to create organization"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateOrg(id: string, payload: UpdateOrgPayload) {
      this.requireOrgId(id)
      this.requireOrgName(payload.name)
      this.isLoading = true
      this.error = null

      try {
        const response = await updateOrgService(id, payload)
        const index = this.orgs.findIndex(org => org.id === id)
        if (index !== -1)
          this.orgs[index] = response.updatedOrg
        if (this.selectedOrg?.id === id)
          this.selectedOrg = response.updatedOrg
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to update organization"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteOrg(orgId: string) {
      this.requireOrgId(orgId)
      this.isLoading = true
      this.error = null

      try {
        const response = await deleteOrgService(orgId)
        this.orgs = this.orgs.filter(org => org.id !== orgId)
        if (this.selectedOrg?.id === orgId)
          this.selectedOrg = null
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to delete organization"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateOrgMember(memberId: string, role: Role, orgId: string) {
      this.requireMemberInfo(memberId, role, orgId)
      this.isLoading = true
      this.error = null

      try {
        const response = await updateOrgMemberService(memberId, { role, orgId })
        this.members = this.members.map(m => (m.id === memberId ? response : m))
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to update member role"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async removeOrgMember(memberId: string, orgId: string) {
      this.requireMemberAndOrg(memberId, orgId)
      this.isLoading = true
      this.error = null

      try {
        const response = await removeUserFromOrgService(orgId, memberId)
        this.members = this.members.filter(m => m.id !== memberId)
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to remove member"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async createInviteLink() {
      this.isLoading = true
      this.error = null

      try {
        const { inviteLink } = await createOrgInviteService()
        this.inviteLink = inviteLink
        return inviteLink
      }
      catch (error: any) {
        this.error = error?.message || "Failed to create invite link"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async acceptInvite(token: string) {
      this.isLoading = true
      this.error = null

      try {
        return await acceptOrgInviteService(token)
      }
      catch (error: any) {
        this.error = error?.message || "Failed to accept invite"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async getAuditLogs(orgId: string, page = 1, limit = 15) {
      this.requireOrgId(orgId)
      this.isLoading = true
      this.auditLogs.error = null

      try {
        const response = await getAuditLogsService(orgId, page, limit)
        this.auditLogs.logs = response.logs
        this.auditLogs.page = response.page
        this.auditLogs.limit = response.limit
        this.auditLogs.total = response.total
      }
      catch (error: any) {
        this.auditLogs.logs = []
        this.auditLogs.page = 1
        this.auditLogs.limit = 15
        this.auditLogs.total = 0
        this.auditLogs.error = error?.message || "Failed to fetch audit logs"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteAuditLogs(filters: DeleteAuditLogsPayload) {
      this.isLoading = true
      this.auditLogs.error = null

      try {
        const response = await deleteAuditLogsService(filters)
        if (this.selectedOrg) {
          await this.getAuditLogs(this.selectedOrg.id, this.auditLogs.page, this.auditLogs.limit)
        }
        return response
      }
      catch (error: any) {
        this.auditLogs.error = error?.message || "Failed to delete audit logs"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async nextAuditLogPage() {
      if (this.hasNextPage && this.selectedOrg) {
        await this.getAuditLogs(this.selectedOrg.id, this.auditLogs.page + 1, this.auditLogs.limit)
      }
    },

    async prevAuditLogPage() {
      if (this.hasPrevPage && this.selectedOrg) {
        await this.getAuditLogs(this.selectedOrg.id, this.auditLogs.page - 1, this.auditLogs.limit)
      }
    },
  },
})
