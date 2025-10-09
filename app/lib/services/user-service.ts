import type { UpdateUserInput } from "#shared/schemas/user"

const API_BASE = "/api/user"

export const userService = {
  /**
   * Fetch current authenticated user
   */
  getUser: async () => {
    const response = await $fetch(`${API_BASE}`, {
      method: "GET",
      credentials: "include",
    })
    return response
  },

  /**
   * Update current user
   * @param data Partial object with name/email
   */
  updateUser: async (data: UpdateUserInput) => {
    const response = await $fetch(`${API_BASE}`, {
      method: "PUT",
      body: data,
      credentials: "include",
    })
    return response
  },

  /**
   * Delete current user
   */
  deleteUser: async () => {
    const response = await $fetch(`${API_BASE}`, {
      method: "DELETE",
      credentials: "include",
    })
    return response
  },
}
