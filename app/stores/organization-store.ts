export const useOrganizationStore = defineStore("organization", () => {
  const orgs = ref<OrganizationType[]>([])
  const activeOrg = ref<OrganizationType & {
    members?: OrganizationMembershipType[]
    inviteLink?: string
    auditLogs?: AuditLogType[]
  }>()
  const members = ref<OrganizationMembershipType[]>([])
  const inviteLink = ref<string | null>(null)
  const auditLogs = ref({
    logs: [] as AuditLogType[],
    page: 1,
    limit: 15,
    total: 0,
    error: null as string | null,
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const totalPages = computed(() => Math.ceil(auditLogs.value.total / auditLogs.value.limit))
  const hasNextPage = computed(() => auditLogs.value.page < totalPages.value)
  const hasPrevPage = computed(() => auditLogs.value.page > 1)

  function requireOrgId(orgId: string) {
    if (!orgId) {
      error.value = "Organization ID is required"
      throw new Error(error.value)
    }
  }

  function requireOrgName(name?: string) {
    if (!name || typeof name !== "string") {
      error.value = "Organization name is required"
      throw new Error(error.value)
    }
  }

  function requireMemberInfo(memberId?: string, role?: Role, orgId?: string) {
    if (!memberId || !role || !orgId) {
      error.value = "Member ID, role, and organization ID are required"
      throw new Error(error.value)
    }
  }

  function requireMemberAndOrg(memberId?: string, orgId?: string) {
    if (!memberId || !orgId) {
      error.value = "Member ID and organization ID are required"
      throw new Error(error.value)
    }
  }

  async function createOrg(payload: CreateOrgPayload) {
    requireOrgName(payload.name)
    isLoading.value = true
    error.value = null

    try {
      const response = await createOrgService(payload)
      orgs.value.push(response.newOrg)
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to create organization"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function updateOrg(orgId: string, payload: UpdateOrgPayload) {
    requireOrgId(orgId)
    requireOrgName(payload.name)
    isLoading.value = true
    error.value = null

    try {
      const response = await updateOrgService(orgId, payload)
      const index = orgs.value.findIndex(org => org.id === orgId)
      if (index !== -1)
        orgs.value[index] = response.updatedOrg
      if (activeOrg.value?.id === orgId)
        activeOrg.value = { ...activeOrg.value, ...response.updatedOrg }
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to update organization"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function deleteOrg(orgId: string) {
    requireOrgId(orgId)
    isLoading.value = true
    error.value = null

    try {
      const response = await deleteOrgService(orgId)
      orgs.value = orgs.value.filter(org => org.id !== orgId)
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to delete organization"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function updateOrgMember(memberId: string, role: Role, orgId: string) {
    requireMemberInfo(memberId, role, orgId)
    isLoading.value = true
    error.value = null

    try {
      const response = await updateOrgMemberService(memberId, { role, orgId })
      members.value = members.value.map(m => (m.userId === memberId ? response : m))
      if (activeOrg.value?.id === orgId) {
        activeOrg.value.members = [...members.value]
      }
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to update member role"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function removeOrgMember(memberId: string, orgId: string) {
    requireMemberAndOrg(memberId, orgId)
    isLoading.value = true
    error.value = null

    try {
      const response = await removeUserFromOrgService(orgId, memberId)
      members.value = members.value.filter(m => m.userId !== memberId)
      if (activeOrg.value?.id === orgId) {
        activeOrg.value.members = [...members.value]
      }
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to remove member"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function createInviteLink() {
    isLoading.value = true
    error.value = null

    try {
      const { inviteLink: link } = await createOrgInviteService()
      inviteLink.value = link
      if (activeOrg.value) {
        activeOrg.value.inviteLink = link
      }
      return link
    }
    catch (error: any) {
      error.value = error.message || "Failed to create invite link"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function acceptInvite(token: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await acceptOrgInviteService(token)
      return response
    }
    catch (error: any) {
      error.value = error.message || "Failed to accept invite"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function getAuditLogs(orgId: string, page = 1, limit = 15) {
    requireOrgId(orgId)
    isLoading.value = true
    auditLogs.value.error = null

    try {
      const response = await getAuditLogsService(orgId, page, limit)
      auditLogs.value.logs = response.logs
      auditLogs.value.page = response.page
      auditLogs.value.limit = response.limit
      auditLogs.value.total = response.total
      if (activeOrg.value?.id === orgId) {
        activeOrg.value.auditLogs = response.logs
      }
    }
    catch (error: any) {
      auditLogs.value.logs = []
      auditLogs.value.page = 1
      auditLogs.value.limit = 15
      auditLogs.value.total = 0
      auditLogs.value.error = error.message || "Failed to get audit logs"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function deleteAuditLogs(filters: DeleteAuditLogsPayload) {
    isLoading.value = true
    auditLogs.value.error = null

    try {
      const response = await deleteAuditLogsService(filters)
      if (activeOrg.value) {
        await getAuditLogs(activeOrg.value.id, auditLogs.value.page, auditLogs.value.limit)
      }
      return response
    }
    catch (error: any) {
      auditLogs.value.error = error.message || "Failed to delete audit logs"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  async function nextAuditLogPage() {
    if (hasNextPage.value && activeOrg.value) {
      await getAuditLogs(activeOrg.value.id, auditLogs.value.page + 1, auditLogs.value.limit)
    }
  }

  async function prevAuditLogPage() {
    if (hasPrevPage.value && activeOrg.value) {
      await getAuditLogs(activeOrg.value.id, auditLogs.value.page - 1, auditLogs.value.limit)
    }
  }

  async function setActiveOrg(org: OrganizationType) {
    isLoading.value = true
    error.value = null
    try {
      await setActiveOrgService(org.id)
      activeOrg.value = org
    }
    catch (error: any) {
      error.value = error.message || "Failed to switch organization"
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    orgs,
    error,
    isLoading,
    members,
    activeOrg,
    inviteLink,
    auditLogs,
    totalPages,
    hasNextPage,
    hasPrevPage,
    createOrg,
    updateOrg,
    deleteOrg,
    updateOrgMember,
    removeOrgMember,
    createInviteLink,
    acceptInvite,
    getAuditLogs,
    deleteAuditLogs,
    nextAuditLogPage,
    prevAuditLogPage,
    setActiveOrg,
  }
})
