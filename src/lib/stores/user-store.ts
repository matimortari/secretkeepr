import { deleteUserService, getUserService, updateUserService } from "~/lib/services/user-service"

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as UserType | null,
    selectedOrganization: null as OrganizationType | null,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async getUser() {
      this.isLoading = true
      this.error = null
      try {
        this.user = await getUserService()

        const storedOrganizationId = localStorage.getItem("active_org_id")
        const matchedOrg = this.user?.memberships?.find(m => m.organization?.id === storedOrganizationId)?.organization

        this.selectedOrganization = matchedOrg || this.user?.memberships?.[0]?.organization || null

        if (this.selectedOrganization) {
          localStorage.setItem("active_org_id", this.selectedOrganization.id)
        }
      }
      catch (error: any) {
        console.error("Failed to get user data", error)
        this.error = error?.message
      }
      finally {
        this.isLoading = false
      }
    },

    async updateUser(data: UpdateUserPayload) {
      if (!this.user) {
        this.error = "No user loaded"
        return
      }
      this.isLoading = true
      this.error = null
      try {
        const result = await updateUserService(data)
        this.user = result.user
        return result
      }
      catch (error: any) {
        console.error("Failed to update user:", error)
        this.error = error?.message
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteUser() {
      this.isLoading = true
      this.error = null
      try {
        await deleteUserService()
        this.user = null
        this.selectedOrganization = null
        localStorage.removeItem("active_org_id")
      }
      catch (error: any) {
        console.error("Failed to delete user:", error)
        this.error = error?.message
      }
      finally {
        this.isLoading = false
      }
    },

    setSelectedOrganization(org: OrganizationType) {
      this.selectedOrganization = org
      localStorage.setItem("active_org_id", org.id)
    },
  },
})
