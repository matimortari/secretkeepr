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
        console.error("Failed to get projects", error)
        this.error = error?.message || "Failed to get projects"
      }
      finally {
        this.isLoading = false
      }
    },

    async createProject(data: { name: string, description?: string, organizationId: string }) {
      this.isLoading = true
      this.error = null
      try {
        const payload = {
          ...data,
          description: data.description === null ? undefined : data.description,
        }
        const response = await createProjectService(payload)
        const newProject = response.newProject
        this.projects.push(newProject)
        return newProject
      }
      catch (error: any) {
        console.error("Failed to create project", error)
        this.error = error?.message || "Failed to create project"
      }
      finally {
        this.isLoading = false
      }
    },

    async deleteProject(id: string) {
      this.isLoading = true
      this.error = null
      try {
        await deleteProjectService(id)
        this.projects = this.projects.filter(p => p.id !== id)
        if (this.currentProject?.id === id)
          this.currentProject = null
      }
      catch (error: any) {
        console.error("Failed to delete project", error)
        this.error = error?.message || "Failed to delete project"
      }
      finally {
        this.isLoading = false
      }
    },

    async updateProject(id: string, updatedData: Partial<ProjectType> & { name: string }) {
      this.isLoading = true
      this.error = null
      try {
        const payload = {
          ...updatedData,
          description: updatedData.description === null ? undefined : updatedData.description,
        }
        const response = await updateProjectService(id, payload)
        const updated = response.updatedProject
        this.currentProject = updated
        this.projects = this.projects.map(p => (p.id === id ? updated : p))
        return updated
      }
      catch (error: any) {
        console.error("Failed to update project", error)
        this.error = error?.message || "Failed to update project"
      }
      finally {
        this.isLoading = false
      }
    },

    async getProjectMembers(projectId: string) {
      this.isLoading = true
      this.error = null
      try {
        const members = await getProjectMembersService(projectId)
        if (this.currentProject?.id === projectId) {
          this.currentProject.members = members
        }
      }
      catch (error: any) {
        console.error("Failed to get project members", error)
        this.error = error?.message || "Failed to get project members"
      }
      finally {
        this.isLoading = false
      }
    },

    async addProjectMember(projectId: string, memberData: { userId: string, role: Role }) {
      this.isLoading = true
      this.error = null
      try {
        const member = await addProjectMemberService(projectId, memberData)
        if (this.currentProject?.id === projectId) {
          this.currentProject.members = [...(this.currentProject.members || []), member.newMember]
        }
        return member.newMember
      }
      catch (error: any) {
        console.error("Failed to add member", error)
        this.error = error?.message || "Failed to add member"
      }
      finally {
        this.isLoading = false
      }
    },

    async updateProjectMember(projectId: string, memberId: string, role: Role) {
      this.isLoading = true
      this.error = null
      try {
        const response = await updateProjectMemberService(projectId, memberId, { role })
        const updated = response.updatedMember
        if (this.currentProject?.id === projectId && this.currentProject.members) {
          this.currentProject.members = this.currentProject.members.map(m =>
            m.id === memberId ? updated : m,
          )
        }
        return updated
      }
      catch (error: any) {
        console.error("Failed to update member", error)
        this.error = error?.message || "Failed to update member"
      }
      finally {
        this.isLoading = false
      }
    },

    async removeProjectMember(projectId: string, memberId: string) {
      this.isLoading = true
      this.error = null
      try {
        await removeProjectMemberService(projectId, memberId)
        if (this.currentProject?.id === projectId && this.currentProject.members) {
          this.currentProject.members = this.currentProject.members.filter(m => m.id !== memberId)
        }
      }
      catch (error: any) {
        console.error("Failed to remove member", error)
        this.error = error?.message || "Failed to remove member"
      }
      finally {
        this.isLoading = false
      }
    },
  },
})
