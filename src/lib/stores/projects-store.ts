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
  }),

  actions: {
    async getProjects() {
      this.isLoading = true
      try {
        this.projects = await getProjectsService()
      }
      catch (error) {
        console.error("Failed to get projects", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async createProject(data: { name: string, description?: string | null, organizationId: string }) {
      this.isLoading = true
      try {
        const newProject = await createProjectService(data as ProjectType)
        this.projects.push(newProject)
      }
      catch (error) {
        console.error("Failed to create project", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteProject(id: string) {
      this.isLoading = true
      try {
        await deleteProjectService(id)
        this.projects = this.projects.filter(p => p.id !== id)
        if (this.currentProject?.id === id)
          this.currentProject = null
      }
      catch (error) {
        console.error("Failed to delete project", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async updateProject(id: string, updatedData: Partial<ProjectType>) {
      this.isLoading = true
      try {
        const updated = await updateProjectService(id, updatedData)
        this.currentProject = updated
        this.projects = this.projects.map(p => (p.id === id ? updated : p))
      }
      catch (error) {
        console.error("Failed to update project", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async getProjectMembers(projectId: string) {
      this.isLoading = true
      try {
        const members = await getProjectMembersService(projectId)
        if (this.currentProject?.id === projectId) {
          this.currentProject.members = members
        }
      }
      catch (error) {
        console.error("Failed to get project members", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async addProjectMember(projectId: string, memberData: { userId: string, role: Role }) {
      this.isLoading = true
      try {
        const member = await addProjectMemberService(projectId, memberData)
        if (this.currentProject?.id === projectId) {
          this.currentProject.members = [...(this.currentProject.members || []), member]
        }
      }
      catch (error) {
        console.error("Failed to add member", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async updateProjectMember(projectId: string, memberId: string, role: Role) {
      this.isLoading = true
      try {
        const response = await updateProjectMemberService(projectId, memberId, { role })
        const updated = response.updatedUser

        if (this.currentProject?.id === projectId && this.currentProject.members) {
          this.currentProject.members = this.currentProject.members.map(m =>
            m.id === memberId ? updated : m,
          )
        }
      }
      catch (error) {
        console.error("Failed to update member", error)
      }
      finally {
        this.isLoading = false
      }
    },

    async removeProjectMember(projectId: string, memberId: string) {
      this.isLoading = true
      try {
        await removeProjectMemberService(projectId, memberId)
        if (this.currentProject?.id === projectId && this.currentProject.members) {
          this.currentProject.members = this.currentProject.members.filter(m => m.id !== memberId)
        }
      }
      catch (error) {
        console.error("Failed to remove member", error)
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
