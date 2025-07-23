import {
  acceptOrganizationInviteService,
  createOrganizationInviteService,
  createOrganizationService,
  deleteAuditLogsService,
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
    setSelectedOrganization(organizationId: string) {
      const found = this.organizations.find(org => org.id === organizationId)
      if (found) {
        this.selectedOrganization = found
        localStorage.setItem("active_org_id", organizationId)
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

    async createOrganization(payload: CreateOrganizationPayload) {
      if (!payload.name || typeof payload.name !== "string") {
        this.error = "Organization name is required and must be a string"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await createOrganizationService(payload)
        this.organizations.push(response.newOrganization)
        return response
      }
      catch (error: any) {
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateOrganization(id: string, payload: UpdateOrganizationPayload) {
      if (!payload.name || typeof payload.name !== "string") {
        this.error = "Organization name is required and must be a string"
        throw new Error(this.error)
      }
      if (!id) {
        this.error = "Organization ID is required"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await updateOrganizationService(id, payload)
        const index = this.organizations.findIndex(org => org.id === id)
        if (index !== -1)
          this.organizations[index] = response.updatedOrganization
        if (this.selectedOrganization?.id === id)
          this.selectedOrganization = response.updatedOrganization
        return response
      }
      catch (error: any) {
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteOrganization(organizationId: string) {
      if (!organizationId) {
        this.error = "Organization ID is required"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await deleteOrganizationService(organizationId)
        this.organizations = this.organizations.filter(org => org.id !== organizationId)
        if (this.selectedOrganization?.id === organizationId)
          this.selectedOrganization = null
        return response
      }
      catch (error: any) {
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateOrganizationMember(memberId: string, role: Role, organizationId: string) {
      if (!memberId || !role || !organizationId) {
        this.error = "Member ID, role, and organization ID are required"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await updateOrganizationMemberService(memberId, { role, organizationId })
        this.members = this.members.map(m => (m.id === memberId ? response : m))
        return response
      }
      catch (error: any) {
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async removeOrganizationMember(memberId: string, organizationId: string) {
      if (!memberId || !organizationId) {
        this.error = "Member ID and organization ID are required"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await removeUserFromOrganizationService(organizationId, memberId)
        this.members = this.members.filter(m => m.id !== memberId)
        return response
      }
      catch (error: any) {
        this.error = error?.message
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
        const { inviteLink } = await createOrganizationInviteService()
        this.inviteLink = inviteLink
        return inviteLink
      }
      catch (error: any) {
        this.error = error?.message
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
        return await acceptOrganizationInviteService(token)
      }
      catch (error: any) {
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async getAuditLogs(organizationId: string, page = 1, limit = 15) {
      if (!organizationId) {
        this.auditLogs.error = "Organization ID is required"
        throw new Error(this.auditLogs.error)
      }

      this.isLoading = true
      this.auditLogs.error = null

      try {
        const response = await getAuditLogsService(organizationId, page, limit)
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
        this.auditLogs.error = error?.message
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
        if (this.selectedOrganization) {
          await this.getAuditLogs(this.selectedOrganization.id, this.auditLogs.page, this.auditLogs.limit)
        }
        return response
      }
      catch (error: any) {
        this.auditLogs.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async nextAuditLogPage() {
      if (this.hasNextPage && this.selectedOrganization) {
        await this.getAuditLogs(this.selectedOrganization.id, this.auditLogs.page + 1, this.auditLogs.limit)
      }
    },

    async prevAuditLogPage() {
      if (this.hasPrevPage && this.selectedOrganization) {
        await this.getAuditLogs(this.selectedOrganization.id, this.auditLogs.page - 1, this.auditLogs.limit)
      }
    },
  },
})
