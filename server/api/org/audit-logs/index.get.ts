import type { JsonValue } from "@prisma/client/runtime/library"
import db from "~~/server/lib/db"
import { getUserFromSession, requireOrgRole } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const orgId = event.context.params?.id || getQuery(event).orgId
  if (!orgId || typeof orgId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  const { page = "1", limit = "20" } = getQuery(event)
  const pageNum = Math.max(Number.parseInt(page as string, 10), 1)
  const limitNum = Math.min(Math.max(Number.parseInt(limit as string, 10), 1), 100)
  const skip = (pageNum - 1) * limitNum

  await requireOrgRole(sessionUser.id!, orgId, ["owner", "admin", "member"])

  const projectsInOrg = await db.project.findMany({
    where: { orgId },
    select: { id: true },
  })
  const projectResourceIds = projectsInOrg.map(p => `Project:${p.id}`)

  const logsWhere = {
    OR: [
      { orgId },
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

  const isPrivileged = await requireOrgRole(sessionUser.id!, orgId, ["owner", "admin"])

  function sanitizeMetadata(metadata: JsonValue) {
    if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
      const { ip, userAgent, ...safeMetadata } = metadata as Record<string, unknown>
      return safeMetadata
    }
    return metadata
  }

  return {
    page: pageNum,
    limit: limitNum,
    total,
    logs: logs.map(log => ({
      ...log,
      metadata: isPrivileged ? log.metadata : sanitizeMetadata(log.metadata),
    })),
  }
})
