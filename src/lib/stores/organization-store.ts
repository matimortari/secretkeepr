import {
  acceptOrganizationInviteService,
  createOrganizationInviteService,
  createOrganizationService,
  deleteOrganizationService,
  getAuditLogsService,
  removeUserFromOrganizationService,
  updateOrganizationMemberService,
  updateOrganizationService,
} from "~/lib/services/organization-service"

export const useOrganizationStore = defineStore("organization", {
  state: () => ({
    organizations: [] as OrganizationType[],
    selectedOrganization: null as OrganizationType | null,
    members: [] as UserOrganizationMembershipType[],
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
      return state.auditLogs.page < Math.ceil(state.auditLogs.total / state.auditLogs.limit)
    },
    hasPrevPage(state): boolean {
      return state.auditLogs.page > 1
    },
  },

  actions: {
    clearError() {
      this.error = null
      this.auditLogs.error = null
    },

    setSelectedOrganization(id: string) {
      const found = this.organizations.find(org => org.id === id)
      if (found) {
        this.selectedOrganization = found
        localStorage.setItem("active_org_id", id)
      }
    },

    getSelectedOrganization() {
      const id = localStorage.getItem("active_org_id")
      if (id) {
        const org = this.organizations.find(o => o.id === id)
        if (org)
          this.selectedOrganization = org
      }
    },

    async createOrganization(data: { name: string }) {
      this.isLoading = true
      this.clearError()
      try {
        const response = await createOrganizationService(data)
        const newOrg = response.newOrganization
        this.organizations.push(newOrg)
        this.selectedOrganization = newOrg
        return newOrg
      }
      catch (error: any) {
        console.error("Failed to create organization", error)
        this.error = error?.message || "Failed to create organization"
      }
      finally {
        this.isLoading = false
      }
    },

    async updateOrganization(id: string, data: Partial<OrganizationType>) {
      this.isLoading = true
      this.clearError()
      try {
        const response = await updateOrganizationService(id, data as CreateOrganizationPayload)
        const updated = response.updatedOrganization
        const index = this.organizations.findIndex(org => org.id === id)
        if (index !== -1)
          this.organizations[index] = updated
        if (this.selectedOrganization?.id === id)
          this.selectedOrganization = updated
        return updated
      }
      catch (error: any) {
        console.error("Failed to update organization", error)
        this.error = error?.message || "Failed to update organization"
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteOrganization(id: string) {
      this.isLoading = true
      this.clearError()
      try {
        const result = await deleteOrganizationService(id)
        this.organizations = this.organizations.filter(org => org.id !== id)
        if (this.selectedOrganization?.id === id)
          this.selectedOrganization = null
        return result
      }
      catch (error: any) {
        console.error("Failed to delete organization", error)
        this.error = error?.message || "Failed to delete organization"
      }
      finally {
        this.isLoading = false
      }
    },

    async updateOrganizationMember(memberId: string, role: Role, organizationId: string) {
      this.isLoading = true
      this.clearError()
      try {
        const updated = await updateOrganizationMemberService(memberId, { role, organizationId })
        this.members = this.members.map(m => (m.id === memberId ? updated : m))
        return updated
      }
      catch (error: any) {
        console.error("Failed to update organization member", error)
        this.error = error?.message || "Failed to update organization member"
      }
      finally {
        this.isLoading = false
      }
    },

    async removeOrganizationMember(memberId: string, organizationId: string) {
      this.isLoading = true
      this.clearError()
      try {
        await removeUserFromOrganizationService(organizationId, memberId)
        this.members = this.members.filter(m => m.id !== memberId)
      }
      catch (error: any) {
        console.error("Failed to remove organization member", error)
        this.error = error?.message || "Failed to remove organization member"
      }
      finally {
        this.isLoading = false
      }
    },

    async createInviteLink() {
      this.isLoading = true
      this.clearError()
      try {
        const { inviteLink } = await createOrganizationInviteService()
        this.inviteLink = inviteLink
        return inviteLink
      }
      catch (error: any) {
        console.error("Failed to create invite link", error)
        this.error = error?.message || "Failed to create invite link"
      }
      finally {
        this.isLoading = false
      }
    },

    async acceptInvite(token: string) {
      this.isLoading = true
      this.clearError()
      try {
        return await acceptOrganizationInviteService(token)
      }
      catch (error: any) {
        console.error("Failed to accept invite", error)
        this.error = error?.message || "Failed to accept invite"
      }
      finally {
        this.isLoading = false
      }
    },

    async getAuditLogs(page = 1, limit = 15) {
      this.isLoading = true
      this.auditLogs.error = null
      try {
        const response = await getAuditLogsService(page, limit)
        this.auditLogs.logs = response.logs
        this.auditLogs.page = response.page
        this.auditLogs.limit = response.limit
        this.auditLogs.total = response.total
      }
      catch (error: any) {
        console.error("Failed to get audit logs", error)
        this.auditLogs.logs = []
        this.auditLogs.page = 1
        this.auditLogs.limit = 15
        this.auditLogs.total = 0
        this.auditLogs.error = error?.message || "Failed to get audit logs"
      }
      finally {
        this.isLoading = false
      }
    },

    async nextAuditLogPage() {
      if (this.hasNextPage) {
        await this.getAuditLogs(this.auditLogs.page + 1, this.auditLogs.limit)
      }
    },

    async prevAuditLogPage() {
      if (this.hasPrevPage) {
        await this.getAuditLogs(this.auditLogs.page - 1, this.auditLogs.limit)
      }
    },
  },
})
