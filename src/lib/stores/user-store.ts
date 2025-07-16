import { deleteUserService, getUserService, updateUserService } from "~/lib/services/user-service"

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as UserType | null,
    selectedOrganization: null as OrganizationType | null,
    isLoading: false,
  }),

  actions: {
    async getUser() {
      this.isLoading = true
      try {
        this.user = await getUserService()

        const storedOrgId = localStorage.getItem("active_org_id")
        const matchedOrg = this.user?.memberships?.find(m => m.organization?.id === storedOrgId)?.organization

        this.selectedOrganization = matchedOrg || this.user?.memberships?.[0]?.organization || null

        if (this.selectedOrganization) {
          localStorage.setItem("active_org_id", this.selectedOrganization.id)
        }
      }
      catch (error) {
        console.error("Failed to get user data", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async updateUser(data: { name?: string, image?: string }) {
      if (!this.user)
        return

      this.isLoading = true
      try {
        const result = await updateUserService(data)
        this.user = result.user
        return result
      }
      catch (error) {
        console.error("Failed to update user:", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteUser() {
      this.isLoading = true
      try {
        await deleteUserService()
        this.user = null
      }
      catch (error) {
        console.error("Failed to delete user:", error)
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
