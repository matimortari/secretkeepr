import type { UpdateUserInput } from "#shared/schemas/user"

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null)
  const organizations = ref<Organization[]>([])
  const activeOrg = ref<ActiveOrg | null>(null)

  const loading = ref<Record<"getUser" | "setActiveOrg" | "updateUser" | "deleteUser", boolean>>({
    getUser: false,
    setActiveOrg: false,
    updateUser: false,
    deleteUser: false,
  })

  const errors = ref<Record<"getUser" | "setActiveOrg" | "updateUser" | "deleteUser", string | null>>({
    getUser: null,
    setActiveOrg: null,
    updateUser: null,
    deleteUser: null,
  })

  async function getUser() {
    loading.value.getUser = true
    errors.value.getUser = null

    try {
      const res = await userService.getUser() as {
        user: User
        organizations: Organization[]
        activeOrg: ActiveOrg | null
      }
      user.value = res.user
      organizations.value = res.organizations || []
      activeOrg.value = res.activeOrg || null
    }
    catch (err: any) {
      errors.value.getUser = err?.message || "Failed to get user"
      console.error("getUser error:", err)
      throw err
    }
    finally {
      loading.value.getUser = false
    }
  }

  async function setActiveOrg(orgId: string) {
    loading.value.setActiveOrg = true
    errors.value.setActiveOrg = null

    try {
      await userService.updateUser({ activeOrgId: orgId })

      if (user.value) {
        user.value.activeOrgId = orgId
      }

      const organization = organizations.value.find(org => org.id === orgId)
      if (organization) {
        activeOrg.value = {
          id: organization.id,
          name: organization.name,
          role: organization.role,
          projects: [],
        }
      }
    }
    catch (err: any) {
      errors.value.setActiveOrg = err?.message || "Failed to set active organization"
      console.error("setActiveOrg error:", err)
      throw err
    }
    finally {
      loading.value.setActiveOrg = false
    }
  }

  async function updateUser(data: UpdateUserInput) {
    loading.value.updateUser = true
    errors.value.updateUser = null

    try {
      const res = await userService.updateUser(data)
      user.value = res.user
    }
    catch (err: any) {
      errors.value.updateUser = err?.message || "Failed to update user"
      console.error("updateUser error:", err)
      throw err
    }
    finally {
      loading.value.updateUser = false
    }
  }

  async function deleteUser() {
    loading.value.deleteUser = true
    errors.value.deleteUser = null

    try {
      await userService.deleteUser()
      user.value = null
      organizations.value = []
      activeOrg.value = null
    }
    catch (err: any) {
      errors.value.deleteUser = err?.message || "Failed to delete user"
      console.error("deleteUser error:", err)
      throw err
    }
    finally {
      loading.value.deleteUser = false
    }
  }

  return {
    loading,
    errors,
    user,
    organizations,
    activeOrg,
    getUser,
    setActiveOrg,
    updateUser,
    deleteUser,
  }
})
