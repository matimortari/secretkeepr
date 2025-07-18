export async function getProjectsService(): Promise<ProjectType[]> {
  const response = await fetch("/api/projects", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to get projects: ${response.statusText}`)
  }
  return await response.json()
}

export async function createProjectService(data: ProjectType): Promise<ProjectType> {
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

export async function updateProjectService(projectId: string, data: Partial<ProjectType>): Promise<ProjectType> {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update project: ${response.statusText}`)
  }

  return await response.json()
}

export async function deleteProjectService(projectId: string): Promise<{ message: string, projectId: string }> {
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
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to get project members: ${response.statusText}`)
  }
  return await response.json()
}

export async function addProjectMemberService(projectId: string, memberData: { userId: string, role: string }): Promise<ProjectMemberType> {
  const response = await fetch(`/api/projects/${projectId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(memberData),
  })
  if (!response.ok) {
    throw new Error(`Failed to add project member: ${response.statusText}`)
  }
  return await response.json()
}

export async function updateProjectMemberService(projectId: string, memberId: string, data: { role: string }): Promise<{ message: string, updatedUser: ProjectMemberType }> {
  const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update project member: ${response.status}`)
  }

  return await response.json()
}

export async function removeProjectMemberService(projectId: string, memberId: string): Promise<{ message: string, memberId: string }> {
  const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to remove project member: ${response.statusText}`)
  }

  return await response.json()
}
