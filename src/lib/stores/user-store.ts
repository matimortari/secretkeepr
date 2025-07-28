import {
  deleteUserService,
  getUserService,
  updateUserImageService,
  updateUserService,
} from "~/lib/services/user-service"

const ACTIVE_ORG_KEY = "active_org_id"

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as UserType | null,
    selectedOrg: null as OrganizationType | null,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    requireUser() {
      if (!this.user) {
        const error = "User not found"
        this.error = error
        throw new Error(error)
      }
    },

    async getUser() {
      this.isLoading = true
      this.error = null

      try {
        this.user = await getUserService()

        const orgFromStorage = localStorage.getItem(ACTIVE_ORG_KEY)
        const matchedOrg = this.user?.memberships?.find(
          m => m.organization?.id === orgFromStorage,
        )?.organization

        this.selectedOrg
          = matchedOrg || this.user?.memberships?.[0]?.organization || null

        if (this.selectedOrg) {
          localStorage.setItem(ACTIVE_ORG_KEY, this.selectedOrg.id)
        }

        return this.user
      }
      catch (error: any) {
        this.error = error?.message || "Failed to fetch user"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateUser(updatedUser: UpdateUserPayload) {
      this.requireUser()
      this.isLoading = true
      this.error = null

      try {
        const response = await updateUserService(updatedUser)
        this.user = response.user
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to update user"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateUserImage(formData: FormData) {
      this.requireUser()
      this.isLoading = true
      this.error = null

      try {
        const response = await updateUserImageService(formData)
        if (this.user)
          this.user.image = response.imageUrl
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to update user image"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteUser() {
      this.requireUser()
      this.isLoading = true
      this.error = null

      try {
        const response = await deleteUserService()
        this.user = null
        this.selectedOrg = null
        localStorage.removeItem(ACTIVE_ORG_KEY)
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to delete user"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
