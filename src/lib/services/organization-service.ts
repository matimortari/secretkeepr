export async function createOrganizationService(data: OrganizationType): Promise<OrganizationType> {
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

export async function updateOrganizationService(orgId: string, data: Partial<OrganizationType>): Promise<OrganizationType> {
  const response = await fetch(`/api/organization/${orgId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error(`Failed to update organization: ${response.statusText}`)
  }

  return await response.json()
}

export async function deleteOrganizationService(orgId: string): Promise<{ message: string, orgId: string }> {
  const response = await fetch(`/api/organization/${orgId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to delete organization: ${response.statusText}`)
  }

  return await response.json()
}

export async function updateOrganizationMemberService(memberId: string, data: { role: Role }): Promise<UserOrganizationMembershipType> {
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

export async function removeOrganizationMemberService(memberId: string): Promise<{ message: string, memberId: string }> {
  const response = await fetch(`/api/organization/members/${memberId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Failed to remove organization member: ${response.statusText}`)
  }

  return await response.json()
}

export async function leaveOrganizationService(memberId: string, organizationId: string): Promise<{ message: string, userId: string }> {
  const response = await fetch(`/api/organization/${organizationId}/members/${memberId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to leave organization: ${response.statusText}`)
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

export async function getAuditLogsService(page: number = 1, limit: number = 20): Promise<AuditLogsResponseType> {
  const response = await fetch(`/api/organization/audit-logs?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error(`Failed to get audit logs for organization: ${response.statusText}`)
  }

  return await response.json()
}
