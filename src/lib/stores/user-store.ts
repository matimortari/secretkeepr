import { deleteUserService, getUserService, updateUserImageService, updateUserService } from "~/lib/services/user-service"

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

        const matchedOrg = this.user?.memberships?.find(m => m.organization?.id === localStorage.getItem("active_org_id"))?.organization
        this.selectedOrganization = matchedOrg || this.user?.memberships?.[0]?.organization || null
        if (this.selectedOrganization) {
          localStorage.setItem("active_org_id", this.selectedOrganization.id)
        }
      }
      catch (error: any) {
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateUser(updatedUser: UpdateUserPayload) {
      if (!this.user) {
        this.error = "No user loaded"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await updateUserService(updatedUser)
        this.user = response.user
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

    async updateUserImage(formData: FormData) {
      if (!this.user) {
        this.error = "No user loaded"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await updateUserImageService(formData)
        this.user.image = response.imageUrl
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

    async deleteUser() {
      this.isLoading = true
      this.error = null

      try {
        const response = await deleteUserService()
        this.user = null
        this.selectedOrganization = null
        localStorage.removeItem("active_org_id")
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

    setSelectedOrganization(org: OrganizationType) {
      this.selectedOrganization = org
      localStorage.setItem("active_org_id", org.id)
    },
  },
})
