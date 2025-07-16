import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

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
  if (memberships.length === 0) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not part of any organization" })
  }

  const organizationIds = memberships.map(m => m.organizationId)

  const projectMemberships = await db.projectMember.findMany({
    where: { userId: sessionUser.id },
    select: { projectId: true },
  })
  const projectResourceIds = projectMemberships.map(pm => `Project:${pm.projectId}`)

  const logsWhere = {
    OR: [
      { resource: { in: organizationIds.map(id => `Organization:${id}`) } },
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
    db.auditLog.count({
      where: logsWhere,
    }),
  ])

  return {
    page: pageNum,
    limit: limitNum,
    total,
    logs,
  }
})
