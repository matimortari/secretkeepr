import db from "#server/lib/db"
import { getUserFromSession, requireOrgRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const orgId = event.context.params?.id
  if (!orgId || typeof orgId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  await requireOrgRole(sessionUser.id!, orgId, ["owner"])

  await db.organizationMembership.deleteMany({
    where: { orgId },
  })

  await db.organization.delete({
    where: { id: orgId },
  })

  return { message: "Organization deleted successfully", orgId }
})
