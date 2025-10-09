import type { AcceptInviteInput, CreateOrgInput, InviteMemberInput, UpdateOrgInput, UpdateOrgMemberInput } from "#shared/schemas/org"

const API_BASE = "/api/org"

export const organizationService = {
  /**
   * Create a new organization
   * @param data Organization creation data
   */
  createOrg: async (data: CreateOrgInput) => {
    const response = await $fetch(`${API_BASE}`, {
      method: "POST",
      body: data,
      credentials: "include",
    })
    return response
  },

  /**
   * Get a specific organization by ID
   * @param orgId Organization ID
   */
  getOrg: async (orgId: string) => {
    const response = await $fetch(`${API_BASE}/${orgId}`, {
      credentials: "include",
    })
    return response
  },

  /**
   * Update an organization
   * @param orgId Organization ID
   * @param data Partial organization data to update
   */
  updateOrg: async (orgId: string, data: UpdateOrgInput) => {
    const response = await $fetch(`${API_BASE}/${orgId}`, {
      method: "PUT",
      body: data,
      credentials: "include",
    })
    return response
  },

  /**
   * Delete an organization
   * @param orgId Organization ID
   */
  deleteOrg: async (orgId: string) => {
    const response = await $fetch(`${API_BASE}/${orgId}`, {
      method: "DELETE",
      credentials: "include",
    })
    return response
  },

  /**
   * Update an organization member's role
   * @param orgId Organization ID
   * @param memberId Member ID
   * @param data Updated member data
   */
  updateOrgMember: async (orgId: string, memberId: string, data: UpdateOrgMemberInput) => {
    const response = await $fetch(`${API_BASE}/${orgId}/members/${memberId}`, {
      method: "PUT",
      body: data,
      credentials: "include",
    })
    return response
  },

  /**
   * Remove a member from an organization
   * @param orgId Organization ID
   * @param memberId Member ID
   */
  removeOrgMember: async (orgId: string, memberId: string) => {
    const response = await $fetch(`${API_BASE}/${orgId}/members/${memberId}`, {
      method: "DELETE",
      credentials: "include",
    })
    return response
  },

  /**
   * Create an invitation to join the organization
   * @param orgId Organization ID
   * @param data Invitation data
   */
  createInvite: async (orgId: string, data: InviteMemberInput) => {
    const response = await $fetch(`${API_BASE}/${orgId}/invite/create`, {
      body: data,
      credentials: "include",
    })
    return response
  },

  /**
   * Accept an organization invitation
   * @param orgId Organization ID
   * @param data Invitation acceptance data (token)
   */
  acceptInvite: async (orgId: string, data: AcceptInviteInput) => {
    const response = await $fetch(`${API_BASE}/${orgId}/invite/accept`, {
      method: "POST",
      body: data,
      credentials: "include",
    })
    return response
  },
}
