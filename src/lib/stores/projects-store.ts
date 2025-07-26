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
    async getProjects() {
      this.isLoading = true
      this.error = null

      try {
        this.projects = await getProjectsService()
      }
      catch (error: any) {
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async createProject(payload: CreateProjectPayload) {
      if (!payload.name || typeof payload.name !== "string") {
        this.error = "Project name is required and must be a string"
        throw new Error(this.error)
      }
      if (!payload.orgId) {
        this.error = "Organization ID is required"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await createProjectService(payload)
        this.projects.push(response.newProject)
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

    async updateProject(payload: UpdateProjectPayload) {
      if (!payload.name || typeof payload.name !== "string") {
        this.error = "Project name is required and must be a string"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await updateProjectService(payload)
        this.currentProject = response.updatedProject
        this.projects = this.projects.map(p => (p.id === payload.id ? response.updatedProject : p))
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

    async deleteProject(projectId: string) {
      if (!projectId) {
        this.error = "Project ID is required"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const response = await deleteProjectService(projectId)
        this.projects = this.projects.filter(p => p.id !== projectId)
        if (this.currentProject?.id === projectId)
          this.currentProject = null
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

    async getProjectMembers(projectId: string) {
      if (!projectId) {
        this.error = "Project ID is required"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const members = await getProjectMembersService(projectId)
        if (this.currentProject?.id === projectId) {
          this.currentProject.members = members
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

    async addProjectMember(projectId: string, data: AddProjectMemberPayload) {
      if (!projectId || !data.userId || !data.role) {
        this.error = "Project ID, User ID, and Role are required"
        throw new Error(this.error)
      }

      this.isLoading = true
      this.error = null

      try {
        const member = await addProjectMemberService(projectId, data)
        if (this.currentProject?.id === projectId) {
          this.currentProject.members = [...(this.currentProject.members || []), member.newMember]
        }
        return member.newMember
      }
      catch (error: any) {
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async updateProjectMember(projectId: string, userId: string, role: Role) {
      if (!projectId || !userId || !role) {
        this.error = "Project ID, User ID, and Role are required"
        throw new Error(this.error)
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
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },

    async removeProjectMember(projectId: string, userId: string) {
      if (!projectId || !userId) {
        this.error = "Project ID and User ID are required"
        throw new Error(this.error)
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
        this.error = error?.message
        throw error
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
