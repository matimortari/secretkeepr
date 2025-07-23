export async function getProjectsService(): Promise<ProjectType[]> {
  const response = await fetch("/api/projects", {
    method: "GET",
  })
  if (!response.ok) {
    throw new Error(`Failed to get projects: ${response.statusText}`)
  }
  return await response.json()
}

export async function createProjectService(data: CreateProjectPayload): Promise<{ message: string, newProject: ProjectType }> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.statusText}`)
  }

  return await response.json()
}

export async function updateProjectService(data: UpdateProjectPayload): Promise<{ message: string, updatedProject: ProjectType }> {
  const response = await fetch(`/api/projects/${data.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update project: ${response.statusText}`)
  }

  return await response.json()
}

export async function deleteProjectService(projectId: string): Promise<{ message: string }> {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to delete project: ${response.statusText}`)
  }

  return await response.json()
}

export async function getProjectMembersService(projectId: string): Promise<ProjectMemberType[]> {
  const response = await fetch(`/api/projects/${projectId}/members`, {
    method: "GET",
  })
  if (!response.ok) {
    throw new Error(`Failed to get project members: ${response.statusText}`)
  }
  return await response.json()
}

export async function addProjectMemberService(projectId: string, data: AddProjectMemberPayload): Promise<{ message: string, newMember: ProjectMemberType }> {
  const response = await fetch(`/api/projects/${projectId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to add project member: ${response.statusText}`)
  }
  return await response.json()
}

export async function updateProjectMemberService(projectId: string, memberId: string, data: { role: Role }): Promise<{ message: string, updatedMember: ProjectMemberType }> {
  const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update project member role: ${response.status}`)
  }

  return await response.json()
}

export async function removeProjectMemberService(projectId: string, memberId: string): Promise<{ message: string, removedMemberId: string }> {
  const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to remove project member: ${response.statusText}`)
  }

  return await response.json()
}
