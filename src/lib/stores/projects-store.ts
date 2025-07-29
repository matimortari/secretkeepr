import {
  addProjectMemberService,
  createProjectService,
  deleteProjectService,
  getProjectMembersService,
  getProjectsService,
  removeProjectMemberService,
  updateProjectMemberService,
  updateProjectService,
} from "~/lib/services/projects-service"

export const useProjectsStore = defineStore("projects", {
  state: () => ({
    projects: [] as ProjectType[],
    currentProject: null as ProjectType | null,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    requireProjectId(projectId: string) {
      if (!projectId) {
        const error = "Project ID is required"
        this.error = error
        throw new Error(error)
      }
    },

    validateCreatePayload(payload: CreateProjectPayload) {
      if (!payload.name || typeof payload.name !== "string") {
        const error = "Project name is required"
        this.error = error
        throw new Error(error)
      }
      if (!payload.orgId) {
        const error = "Organization ID is required"
        this.error = error
        throw new Error(error)
      }
    },

    validateUpdatePayload(payload: UpdateProjectPayload) {
      if (!payload.name || typeof payload.name !== "string") {
        const error = "Project name is required"
        this.error = error
        throw new Error(error)
      }
    },

    async getProjects() {
      this.isLoading = true
      this.error = null

      try {
        this.projects = await getProjectsService()
        return this.projects
      }
      catch (error: any) {
        this.error = error?.message || "Failed to load projects"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async createProject(payload: CreateProjectPayload) {
      this.validateCreatePayload(payload)
      this.isLoading = true
      this.error = null

      try {
        const response = await createProjectService(payload)
        this.projects.push(response.newProject)
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to create project"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateProject(projectId: string, payload: UpdateProjectPayload) {
      this.validateUpdatePayload(payload)
      this.requireProjectId(projectId)
      this.isLoading = true
      this.error = null

      try {
        const response = await updateProjectService(projectId, payload)
        this.currentProject = response.updatedProject
        this.projects = this.projects.map(p =>
          p.id === projectId ? response.updatedProject : p,
        )
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to update project"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteProject(projectId: string) {
      this.requireProjectId(projectId)
      this.isLoading = true
      this.error = null

      try {
        const response = await deleteProjectService(projectId)
        this.projects = this.projects.filter(p => p.id !== projectId)
        if (this.currentProject?.id === projectId) {
          this.currentProject = null
        }
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to delete project"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async getProjectMembers(projectId: string) {
      this.requireProjectId(projectId)
      this.isLoading = true
      this.error = null

      try {
        const members = await getProjectMembersService(projectId)
        if (this.currentProject?.id === projectId) {
          this.currentProject.members = members
        }
        return members
      }
      catch (error: any) {
        this.error = error?.message || "Failed to load project members"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async addProjectMember(projectId: string, data: AddProjectMemberPayload) {
      this.requireProjectId(projectId)
      if (!data.userId || !data.role) {
        const error = "User ID and Role are required"
        this.error = error
        throw new Error(error)
      }
      this.isLoading = true
      this.error = null

      try {
        const member = await addProjectMemberService(projectId, data)
        if (this.currentProject?.id === projectId) {
          this.currentProject.members = [
            ...(this.currentProject.members || []),
            member.newMember,
          ]
        }
        return member.newMember
      }
      catch (error: any) {
        this.error = error?.message || "Failed to add project member"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateProjectMember(projectId: string, userId: string, role: Role) {
      this.requireProjectId(projectId)
      if (!userId || !role) {
        const error = "User ID and Role are required"
        this.error = error
        throw new Error(error)
      }
      this.isLoading = true
      this.error = null

      try {
        const response = await updateProjectMemberService(projectId, userId, { role })
        if (this.currentProject?.id === projectId && this.currentProject.members) {
          this.currentProject.members = this.currentProject.members.map(m =>
            m.id === userId ? response.updatedMember : m,
          )
        }
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to update project member"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async removeProjectMember(projectId: string, userId: string) {
      this.requireProjectId(projectId)
      if (!userId) {
        const error = "User ID is required"
        this.error = error
        throw new Error(error)
      }
      this.isLoading = true
      this.error = null

      try {
        const response = await removeProjectMemberService(projectId, userId)
        if (this.currentProject?.id === projectId && this.currentProject.members) {
          this.currentProject.members = this.currentProject.members.filter(m => m.id !== userId)
        }
        return response
      }
      catch (error: any) {
        this.error = error?.message || "Failed to remove project member"
        throw error
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
