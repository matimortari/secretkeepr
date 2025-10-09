import db from "#server/lib/db"
import { getUserFromSession, requireOrgRole, sanitizeMetadata } from "#server/lib/utils"
import { getAuditLogsSchema } from "#shared/schemas/audit-logs"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const orgId = getRouterParam(event, "orgId")!
  const query = getQuery(event)

  await requireOrgRole(sessionUser.id, orgId, ["owner", "admin"])

  const { page, limit, action, resource, userId, startDate, endDate } = getAuditLogsSchema.parse(query)

  // Build filter conditions
  const where: any = {
    orgId,
  }

  if (action) {
    where.action = action
  }

  if (resource) {
    where.resource = resource
  }

  if (userId) {
    where.userId = userId
  }

  if (startDate || endDate) {
    where.createdAt = {}
    if (startDate) {
      where.createdAt.gte = new Date(startDate)
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate)
    }
  }

  const skip = (page - 1) * limit

  const [auditLogs, totalCount] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    db.auditLog.count({ where }),
  ])

  // Sanitize metadata to remove sensitive information
  const sanitizedLogs = auditLogs.map(log => ({
    id: log.id,
    action: log.action,
    resource: log.resource,
    metadata: sanitizeMetadata(log.metadata),
    createdAt: log.createdAt,
    user: log.user,
  }))

  return {
    auditLogs: sanitizedLogs,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
    },
  }
})
