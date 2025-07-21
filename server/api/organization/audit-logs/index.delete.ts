import db from "~/lib/db"
import { getUserFromSession, requireOrgRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const body = await readBody(event)

  const {
    organizationId,
    action,
    beforeDate,
    createdBySelfOnly = false,
    protectedActions = ["organization.create"],
  } = body
  if (!organizationId || typeof organizationId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  await requireOrgRole(sessionUser.id, organizationId, ["owner", "admin"])

  const whereClause: any = {
    organizationId,
    action: action ? { equals: action } : undefined,
    createdAt: beforeDate ? { lt: new Date(beforeDate) } : undefined,
    userId: createdBySelfOnly ? sessionUser.id : undefined,
    NOT: {
      action: {
        in: protectedActions,
      },
    },
  }

  const logsToDelete = await db.auditLog.findMany({
    where: whereClause,
    select: { id: true },
  })
  if (logsToDelete.length === 0) {
    return { message: "No audit logs matched the given criteria." }
  }

  const deletedLogs = await db.auditLog.deleteMany({
    where: {
      id: { in: logsToDelete.map(l => l.id) },
    },
  })

  return {
    message: `Deleted ${deletedLogs.count} audit log(s).`,
    deletedCount: deletedLogs.count,
  }
})
