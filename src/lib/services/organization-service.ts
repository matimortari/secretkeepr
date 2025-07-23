export async function createOrganizationService(data: CreateOrganizationPayload): Promise<{ message: string, newOrganization: OrganizationType }> {
  const response = await fetch("/api/organization", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to create organization: ${response.statusText}`)
  }

  return await response.json()
}

export async function updateOrganizationService(organizationId: string, data: UpdateOrganizationPayload): Promise<{ message: string, updatedOrganization: OrganizationType }> {
  const response = await fetch(`/api/organization/${organizationId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update organization: ${response.statusText}`)
  }

  return await response.json()
}

export async function deleteOrganizationService(organizationId: string): Promise<{ message: string, organizationId: string }> {
  const response = await fetch(`/api/organization/${organizationId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to delete organization: ${response.statusText}`)
  }

  return await response.json()
}

export async function updateOrganizationMemberService(memberId: string, data: { role: Role, organizationId: string }): Promise<UserOrganizationMembershipType> {
  const response = await fetch(`/api/organization/members/${memberId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update organization member: ${response.statusText}`)
  }

  return await response.json()
}

export async function removeUserFromOrganizationService(organizationId: string, memberId: string): Promise<{ message: string, userId: string }> {
  const response = await fetch(`/api/organization/members/${memberId}?organizationId=${organizationId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to remove user from organization: ${response.statusText}`)
  }

  return await response.json()
}

export async function createOrganizationInviteService(): Promise<{ inviteLink: string }> {
  const response = await fetch("/api/organization/invite-create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to create organization invite: ${response.statusText}`)
  }

  return await response.json()
}

export async function acceptOrganizationInviteService(token: string): Promise<{ message: string }> {
  const response = await fetch(`/api/organization/invite-accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })
  if (!response.ok) {
    throw new Error(`Failed to accept organization invite: ${response.statusText}`)
  }

  return await response.json()
}

export async function getAuditLogsService(organizationId: string, page: number = 1, limit: number = 20): Promise<AuditLogsResponse> {
  const response = await fetch(`/api/organization/audit-logs?organizationId=${organizationId}&page=${page}&limit=${limit}`, {
    method: "GET",
  })
  if (!response.ok) {
    throw new Error(`Failed to get audit logs for organization: ${response.statusText}`)
  }

  return await response.json()
}

export async function deleteAuditLogsService(data: DeleteAuditLogsPayload): Promise<{ message: string, deletedCount: number }> {
  const response = await fetch("/api/organization/audit-logs", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to delete audit logs: ${response.statusText}`)
  }

  return await response.json()
}
