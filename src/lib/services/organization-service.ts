export async function createOrgService(data: CreateOrgPayload): Promise<{ message: string, newOrg: OrganizationType }> {
  const response = await fetch("/api/org", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to create organization: ${response.statusText}`)
  }

  return await response.json()
}

export async function updateOrgService(orgId: string, data: UpdateOrgPayload): Promise<{ message: string, updatedOrg: OrganizationType }> {
  const response = await fetch(`/api/org/${orgId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update organization: ${response.statusText}`)
  }

  return await response.json()
}

export async function deleteOrgService(orgId: string): Promise<{ message: string, orgId: string }> {
  const response = await fetch(`/api/org/${orgId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to delete organization: ${response.statusText}`)
  }

  return await response.json()
}

export async function updateOrgMemberService(memberId: string, data: { role: Role, orgId: string }): Promise<UserOrgMembershipType> {
  const response = await fetch(`/api/org/members/${memberId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update organization member: ${response.statusText}`)
  }

  return await response.json()
}

export async function removeUserFromOrgService(orgId: string, memberId: string): Promise<{ message: string, userId: string }> {
  const response = await fetch(`/api/org/members/${memberId}?orgId=${orgId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to remove user from organization: ${response.statusText}`)
  }

  return await response.json()
}

export async function createOrgInviteService(): Promise<{ inviteLink: string }> {
  const response = await fetch("/api/org/invite/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to create organization invite: ${response.statusText}`)
  }

  return await response.json()
}

export async function acceptOrgInviteService(token: string): Promise<{ message: string }> {
  const response = await fetch(`/api/org/invite/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
  if (!response.ok) {
    throw new Error(`Failed to accept organization invite: ${response.statusText}`)
  }

  return await response.json()
}

export async function getAuditLogsService(orgId: string, page: number = 1, limit: number = 20): Promise<AuditLogsResponse> {
  const response = await fetch(`/api/org/audit-logs?orgId=${orgId}&page=${page}&limit=${limit}`, {
    method: "GET",
  })
  if (!response.ok) {
    throw new Error(`Failed to get audit logs for organization: ${response.statusText}`)
  }

  return await response.json()
}

export async function deleteAuditLogsService(data: DeleteAuditLogsPayload): Promise<{ message: string, deletedCount: number }> {
  const response = await fetch("/api/org/audit-logs", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to delete audit logs: ${response.statusText}`)
  }

  return await response.json()
}
