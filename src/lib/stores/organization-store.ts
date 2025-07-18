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
  }),

  getters: {
    // Audit log pagination helpers
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
      try {
        const newOrg = await createOrganizationService(data as OrganizationType)
        this.organizations.push(newOrg)
        this.selectedOrganization = newOrg
      }
      catch (error) {
        console.error("Failed to create organization", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async updateOrganization(id: string, data: Partial<OrganizationType>) {
      this.isLoading = true
      try {
        const updated = await updateOrganizationService(id, data)
        const index = this.organizations.findIndex(org => org.id === id)
        if (index !== -1)
          this.organizations[index] = updated
        if (this.selectedOrganization?.id === id)
          this.selectedOrganization = updated
      }
      catch (error) {
        console.error("Failed to update organization", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteOrganization(id: string) {
      this.isLoading = true
      try {
        const result = await deleteOrganizationService(id)
        this.organizations = this.organizations.filter(org => org.id !== id)
        if (this.selectedOrganization?.id === id)
          this.selectedOrganization = null
        return result
      }
      catch (error) {
        console.error("Failed to delete organization", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async updateOrganizationMember(memberId: string, role: Role, organizationId: string) {
      this.isLoading = true
      try {
        const updated = await updateOrganizationMemberService(memberId, { role, organizationId })
        this.members = this.members.map(m => (m.id === memberId ? updated : m))
      }
      catch (error) {
        console.error("Failed to update organization member", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async removeOrganizationMember(memberId: string, organizationId: string) {
      this.isLoading = true
      try {
        await removeUserFromOrganizationService(organizationId, memberId)
        this.members = this.members.filter(m => m.id !== memberId)
      }
      catch (error) {
        console.error("Failed to remove organization member", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async createInviteLink() {
      this.isLoading = true
      try {
        const { inviteLink } = await createOrganizationInviteService()
        this.inviteLink = inviteLink
      }
      catch (error) {
        console.error("Failed to create invite link", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async acceptInvite(token: string) {
      this.isLoading = true
      try {
        return await acceptOrganizationInviteService(token)
      }
      catch (error) {
        console.error("Failed to accept invite", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async getAuditLogs(page = 1, limit = 15) {
      this.isLoading = true
      try {
        const response = await getAuditLogsService(page, limit)
        this.auditLogs.logs = response.logs
        this.auditLogs.page = response.page
        this.auditLogs.limit = response.limit
        this.auditLogs.total = response.total
      }
      catch (error) {
        console.error("Failed to get audit logs", error)
        this.auditLogs.logs = []
        this.auditLogs.page = 1
        this.auditLogs.limit = 15
        this.auditLogs.total = 0
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
