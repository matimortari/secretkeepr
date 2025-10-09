import type { AddProjectMemberInput, CreateProjectInput, UpdateProjectInput, UpdateProjectMemberInput } from "#shared/schemas/project"
import type { CreateSecretInput, UpdateSecretInput } from "#shared/schemas/secret"

const API_BASE = "/api/projects"

export const projectService = {
  /**
   * Fetch all projects for current user
   * @param orgId Optional organization ID to filter projects
   */
  getProjects: async (orgId?: string) => {
    const url = orgId ? `${API_BASE}?orgId=${orgId}` : API_BASE
    const response = await $fetch(url, {
      method: "GET",
      credentials: "include",
    })
    return response
  },

  /**
   * Create a new project
   * @param data Project creation data
   */
  createProject: async (data: CreateProjectInput) => {
    const response = await $fetch(`${API_BASE}`, {
      method: "POST",
      body: data,
      credentials: "include",
    })
    return response
  },

  /**
   * Update a project
   * @param projectId Project ID
   * @param data Partial project data to update
   */
  updateProject: async (projectId: string, data: UpdateProjectInput) => {
    const response = await $fetch(`${API_BASE}/${projectId}`, {
      method: "PUT",
      body: data,
      credentials: "include",
    })
    return response
  },

  /**
   * Delete a project
   * @param projectId Project ID
   */
  deleteProject: async (projectId: string) => {
    const response = await $fetch(`${API_BASE}/${projectId}`, {
      method: "DELETE",
      credentials: "include",
    })
    return response
  },

  /**
   * Add a member to a project
   * @param projectId Project ID
   * @param data Member data
   */
  addProjectMember: async (projectId: string, data: AddProjectMemberInput) => {
    const response = await $fetch(`${API_BASE}/${projectId}/members`, {
      method: "POST",
      body: data,
      credentials: "include",
    })
    return response
  },

  /**
   * Update a project member's role
   * @param projectId Project ID
   * @param memberId Member ID
   * @param data Updated member data
   */
  updateProjectMember: async (projectId: string, memberId: string, data: UpdateProjectMemberInput) => {
    const response = await $fetch(`${API_BASE}/${projectId}/members/${memberId}`, {
      method: "PUT",
      body: data,
      credentials: "include",
    })
    return response
  },

  /**
   * Remove a member from a project
   * @param projectId Project ID
   * @param memberId Member ID
   */
  removeProjectMember: async (projectId: string, memberId: string) => {
    const response = await $fetch(`${API_BASE}/${projectId}/members/${memberId}`, {
      method: "DELETE",
      credentials: "include",
    })
    return response
  },

  /**
   * Get all secrets for a project
   * @param projectId Project ID
   */
  getProjectSecrets: async (projectId: string) => {
    const response = await $fetch(`${API_BASE}/${projectId}/secrets`, {
      method: "GET",
      credentials: "include",
    })
    return response
  },

  /**
   * Create a new secret in a project
   * @param projectId Project ID
   * @param data Secret creation data
   */
  createProjectSecret: async (projectId: string, data: CreateSecretInput) => {
    const response = await $fetch(`${API_BASE}/${projectId}/secrets`, {
      method: "POST",
      body: data,
      credentials: "include",
    })
    return response
  },

  /**
   * Update a project secret
   * @param projectId Project ID
   * @param secretId Secret ID
   * @param data Updated secret data
   */
  updateProjectSecret: async (projectId: string, secretId: string, data: UpdateSecretInput) => {
    const response = await $fetch(`${API_BASE}/${projectId}/secrets/${secretId}`, {
      method: "PUT",
      body: data,
      credentials: "include",
    })
    return response
  },

  /**
   * Delete a project secret
   * @param projectId Project ID
   * @param secretId Secret ID
   */
  deleteProjectSecret: async (projectId: string, secretId: string) => {
    const response = await $fetch(`${API_BASE}/${projectId}/secrets/${secretId}`, {
      method: "DELETE",
      credentials: "include",
    })
    return response
  },
}
