import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "#server/lib/utils"
import { deleteAuditLogsSchema } from "#shared/schemas/audit-logs"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const orgId = getRouterParam(event, "orgId")!
  const body = await readBody(event)

  await requireOrgRole(sessionUser.id, orgId, ["owner"])

  const { olderThan, action, resource, userId } = deleteAuditLogsSchema.parse(body)

  // Build filter conditions
  const where: any = {
    orgId,
  }
  if (olderThan) {
    where.createdAt = {
      lt: new Date(olderThan),
    }
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

  // If no filters are provided, require olderThan to prevent accidental deletion of all logs
  if (!olderThan && !action && !resource && !userId) {
    throw createError({ statusCode: 400, statusMessage: "At least one filter parameter is required to prevent accidental deletion of all audit logs" })
  }

  // Count logs that will be deleted
  const logsToDeleteCount = await db.auditLog.count({ where })
  if (logsToDeleteCount === 0) {
    return { deletedCount: 0, message: "No audit logs match the specified criteria" }
  }

  const deleteResult = await db.auditLog.deleteMany({ where })

  await createAuditLog({
    userId: sessionUser.id,
    orgId,
    action: "delete",
    resource: "audit_logs",
    metadata: {
      deletedCount: deleteResult.count,
      filters: {
        olderThan,
        action,
        resource,
        userId,
      },
    },
    req: event.node.req,
  })

  return {
    deletedCount: deleteResult.count,
    message: `Successfully deleted ${deleteResult.count} audit log(s)`,
  }
})
