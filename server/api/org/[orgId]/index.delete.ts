import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const orgId = getRouterParam(event, "orgId")
  if (!orgId) {
    throw createError({ statusCode: 400, message: "Organization ID is required" })
  }

  await requireOrgRole(sessionUser.id, orgId, ["owner"])

  const organization = await db.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      memberships: {
        select: { userId: true },
      },
      projects: {
        select: { id: true, name: true },
      },
    },
  })
  if (!organization) {
    throw createError({ statusCode: 404, message: "Organization not found" })
  }

  const usersWithActiveOrg = await db.user.findMany({
    where: { activeOrgId: orgId },
    select: { id: true },
  })

  await createAuditLog({
    userId: sessionUser.id,
    orgId,
    action: "delete",
    resource: "organization",
    metadata: {
      organizationName: organization.name,
      memberCount: organization.memberships.length,
      projectCount: organization.projects.length,
      projects: organization.projects.map(p => ({ id: p.id, name: p.name })),
    },
    req: event.node.req,
  })

  await db.organization.delete({
    where: { id: orgId },
  })
  if (usersWithActiveOrg.length > 0) {
    await db.user.updateMany({
      where: { id: { in: usersWithActiveOrg.map(u => u.id) } },
      data: { activeOrgId: null },
    })
  }

  return { success: true, message: "Organization deleted successfully" }
})
