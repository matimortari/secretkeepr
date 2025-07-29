import { getBaseUrl } from "~/lib/utils"

export async function createOrgService(data: CreateOrgPayload): Promise<{ message: string, newOrg: OrganizationType }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/org`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function updateOrgService(orgId: string, data: UpdateOrgPayload): Promise<{ message: string, updatedOrg: OrganizationType }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/org/${orgId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function deleteOrgService(orgId: string): Promise<{ message: string, orgId: string }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/org/${orgId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function updateOrgMemberService(memberId: string, data: { role: Role, orgId: string }): Promise<UserOrgMembershipType> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/org/members/${memberId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function removeUserFromOrgService(orgId: string, memberId: string): Promise<{ message: string, userId: string }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/org/members/${memberId}?orgId=${orgId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function createOrgInviteService(): Promise<{ inviteLink: string }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/org/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function acceptOrgInviteService(token: string): Promise<{ message: string }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/org/invite/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function getAuditLogsService(orgId: string, page: number = 1, limit: number = 20): Promise<AuditLogsResponse> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/org/audit-logs?orgId=${orgId}&page=${page}&limit=${limit}`, {
    method: "GET",
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}

export async function deleteAuditLogsService(data: DeleteAuditLogsPayload): Promise<{ message: string, deletedCount: number }> {
  const baseUrl = getBaseUrl()
  const response = await fetch(`${baseUrl}/api/org/audit-logs`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok)
    throw new Error(response.statusText)
  return await response.json()
}
