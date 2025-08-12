import {
  deleteUserService,
  getUserService,
  updateUserImageService,
  updateUserService,
} from "~/lib/services/user-service"

export const useUserStore = defineStore("user", () => {
  const user = ref<UserType | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function requireUser() {
    if (!user.value) {
      error.value = "User not found"
      throw new Error(error.value)
    }
  }

  async function getUser() {
    isLoading.value = true
    error.value = null

    try {
      user.value = await getUserService()
      return user.value
    }
    catch (error: any) {
      error.value = error.message || "Failed to get user"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function updateUser(payload: UpdateUserPayload) {
    requireUser()
    isLoading.value = true
    error.value = null

    try {
      const response = await updateUserService(payload)
      user.value = response.user
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to update user data"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function updateUserImage(image: FormData) {
    requireUser()
    isLoading.value = true
    error.value = null

    try {
      const response = await updateUserImageService(image)
      if (user.value)
        user.value.image = response.imageUrl
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to update user image"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function deleteUser() {
    requireUser()
    isLoading.value = true
    error.value = null

    try {
      const response = await deleteUserService()
      user.value = null
      localStorage.removeItem("active_org_id")
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to delete user"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    error,
    getUser,
    updateUser,
    updateUserImage,
    deleteUser,
  }
})
