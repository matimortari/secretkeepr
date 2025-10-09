import db from "#server/lib/db"
import { getUserFromSession, requireOrgRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const orgId = getRouterParam(event, "orgId")!

  await requireOrgRole(sessionUser.id, orgId, ["owner", "admin"])

  // Get distinct actions and resources from audit logs for the organization
  const [actions, resources, users] = await Promise.all([
    db.auditLog.findMany({
      where: { orgId },
      select: { action: true },
      distinct: ["action"],
    }),

    db.auditLog.findMany({
      where: { orgId },
      select: { resource: true },
      distinct: ["resource"],
    }),

    db.auditLog.findMany({
      where: { orgId },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      distinct: ["userId"],
    }),
  ])

  return {
    actions: actions.map(item => item.action).sort(),
    resources: resources.map(item => item.resource).sort(),
    users: users.map(item => item.user).sort((a, b) => a.name.localeCompare(b.name)),
  }
})
