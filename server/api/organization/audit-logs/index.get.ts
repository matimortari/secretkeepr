import db from "~/lib/db"
import { getUserFromSession, requireOrgRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const { page = "1", limit = "20" } = getQuery(event)
  const pageNum = Math.max(Number.parseInt(page as string, 10), 1)
  const limitNum = Math.min(Math.max(Number.parseInt(limit as string, 10), 1), 100)
  const skip = (pageNum - 1) * limitNum

  const memberships = await db.userOrganizationMembership.findMany({
    where: { userId: sessionUser.id },
    select: { organizationId: true },
  })

  const organizationRoles = await Promise.all(memberships.map(async ({ organizationId }) => {
    try {
      const membership = await requireOrgRole(sessionUser.id!, organizationId, ["owner", "admin", "member"])
      return { organizationId, role: membership.role }
    }
    catch {
      return null
    }
  }))

  const validOrganizationRoles = organizationRoles.filter(Boolean) as { organizationId: string, role: string }[]
  if (validOrganizationRoles.length === 0) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: insufficient permissions" })
  }

  const ownerOrganizationIds = validOrganizationRoles.filter(r => r.role === "owner").map(r => r.organizationId)
  const adminOrganizationIds = validOrganizationRoles.filter(r => r.role === "admin").map(r => r.organizationId)

  const projectMemberships = await db.projectMember.findMany({
    where: { userId: sessionUser.id },
    select: { projectId: true },
  })
  const projectResourceIds = projectMemberships.map(pm => `Project:${pm.projectId}`)

  const logsWhere = {
    OR: [
      { resource: { in: ownerOrganizationIds.map(id => `Organization:${id}`) } },
      { resource: { in: adminOrganizationIds.map(id => `Organization:${id}`) } },
      { resource: { in: projectResourceIds } },
    ],
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where: logsWhere,
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNum,
    }),
    db.auditLog.count({ where: logsWhere }),
  ])

  return {
    page: pageNum,
    limit: limitNum,
    total,
    logs,
  }
})
