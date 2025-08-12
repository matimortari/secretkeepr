import {
  addProjectMemberService,
  createProjectService,
  deleteProjectService,
  getProjectsService,
  removeProjectMemberService,
  updateProjectMemberService,
  updateProjectService,
} from "~/lib/services/projects-service"

export const useProjectsStore = defineStore("projects", () => {
  const projects = ref<ProjectType[]>([])
  const currentProject = ref<ProjectType | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function requireProjectId(projectId: string) {
    if (!projectId) {
      error.value = "Project ID is required"
      throw new Error(error.value)
    }
  }

  function validateCreatePayload(payload: CreateProjectPayload) {
    if (!payload.name || typeof payload.name !== "string") {
      error.value = "Project name is required"
      throw new Error(error.value)
    }
    if (!payload.orgId) {
      error.value = "Organization ID is required"
      throw new Error(error.value)
    }
  }

  function validateUpdatePayload(payload: UpdateProjectPayload) {
    if (!payload.name || typeof payload.name !== "string") {
      error.value = "Project name is required"
      throw new Error(error.value)
    }
  }

  async function getProjects() {
    isLoading.value = true
    error.value = null

    try {
      projects.value = await getProjectsService()
      if (currentProject.value) {
        currentProject.value
          = projects.value.find(p => p.id === currentProject.value?.id) || null
      }
      return projects.value
    }
    catch (error: any) {
      error.value = error.message || "Failed to load projects"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function createProject(payload: CreateProjectPayload) {
    validateCreatePayload(payload)
    isLoading.value = true
    error.value = null

    try {
      const response = await createProjectService(payload)
      projects.value.push(response.newProject)
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to create project"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function updateProject(projectId: string, payload: UpdateProjectPayload) {
    validateUpdatePayload(payload)
    requireProjectId(projectId)
    isLoading.value = true
    error.value = null

    try {
      const response = await updateProjectService(projectId, payload)
      currentProject.value = response.updatedProject
      projects.value = projects.value.map(p =>
        p.id === projectId ? response.updatedProject : p,
      )
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to update project"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function deleteProject(projectId: string) {
    requireProjectId(projectId)
    isLoading.value = true
    error.value = null

    try {
      const response = await deleteProjectService(projectId)
      projects.value = projects.value.filter(p => p.id !== projectId)
      if (currentProject.value?.id === projectId) {
        currentProject.value = null
      }
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to delete project"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function addProjectMember(projectId: string, payload: AddProjectMemberPayload) {
    requireProjectId(projectId)
    if (!payload.userId || !payload.role) {
      error.value = "User ID and Role are required"
      throw new Error(error.value)
    }
    isLoading.value = true
    error.value = null

    try {
      const member = await addProjectMemberService(projectId, payload)
      if (currentProject.value?.id === projectId) {
        currentProject.value.members = [
          ...(currentProject.value.members || []),
          member.newMember,
        ]
      }
      return member.newMember
    }
    catch (error: any) {
      error.value = error.message || "Failed to add project member"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function updateProjectMember(projectId: string, userId: string, role: Role) {
    requireProjectId(projectId)
    if (!userId || !role) {
      error.value = "User ID and Role are required"
      throw new Error(error.value)
    }
    isLoading.value = true
    error.value = null

    try {
      const response = await updateProjectMemberService(projectId, userId, { role })
      if (currentProject.value?.id === projectId && currentProject.value.members) {
        currentProject.value.members = currentProject.value.members.map(m =>
          m.userId === userId ? response.updatedMember : m,
        )
      }
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to update project member"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function removeProjectMember(projectId: string, memberId: string) {
    requireProjectId(projectId)
    if (!memberId) {
      error.value = "User ID is required"
      throw new Error(error.value)
    }
    isLoading.value = true
    error.value = null

    try {
      const response = await removeProjectMemberService(projectId, memberId)
      if (currentProject.value?.id === projectId && currentProject.value.members) {
        currentProject.value.members = currentProject.value.members.filter(m => m.userId !== memberId)
      }
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to remove project member"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    projects,
    currentProject,
    isLoading,
    error,
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    addProjectMember,
    updateProjectMember,
    removeProjectMember,
  }
})
