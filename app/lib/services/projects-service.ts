import { getBaseUrl } from "~/lib/utils"

export async function getProjectsService(): Promise<ProjectType[]> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects`, {
    method: "GET",
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function createProjectService(payload: CreateProjectPayload): Promise<{ message: string, newProject: ProjectType }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function updateProjectService(projectId: string, payload: UpdateProjectPayload): Promise<{ message: string, updatedProject: ProjectType }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function deleteProjectService(projectId: string): Promise<{ message: string }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects/${projectId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function addProjectMemberService(projectId: string, payload: AddProjectMemberPayload): Promise<{ message: string, newMember: ProjectMemberType }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function updateProjectMemberService(projectId: string, memberId: string, payload: { role: Role }): Promise<{ message: string, updatedMember: ProjectMemberType }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/members/${memberId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!response.ok)
    throw new Error(`${response.status}`)
  return await response.json()
}

export async function removeProjectMemberService(projectId: string, memberId: string): Promise<{ message: string, removedMemberId: string }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/projects/${projectId}/members/${memberId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}
