import db from "~/lib/db"
import { getUserFromSession, requireOrgRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const organizationId = event.context.params?.id || getQuery(event).organizationId
  if (!organizationId || typeof organizationId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  // Pagination
  const { page = "1", limit = "20" } = getQuery(event)
  const pageNum = Math.max(Number.parseInt(page as string, 10), 1)
  const limitNum = Math.min(Math.max(Number.parseInt(limit as string, 10), 1), 100)
  const skip = (pageNum - 1) * limitNum

  // Check user role in this organization
  await requireOrgRole(sessionUser.id!, organizationId, ["owner", "admin", "member"])

  // Optionally, get project IDs under this org if you want to show project audit logs too
  const projectsInOrg = await db.project.findMany({
    where: { organizationId },
    select: { id: true },
  })
  const projectResourceIds = projectsInOrg.map(p => `Project:${p.id}`)

  // Filter audit logs only for this organization and related projects
  const logsWhere = {
    OR: [
      { organizationId }, // audit logs tied directly to this org
      { resource: { in: projectResourceIds } }, // plus related projects' audit logs if you want
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
