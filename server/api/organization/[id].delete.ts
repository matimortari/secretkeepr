import db from "~~/server/lib/db"
import { getUserFromSession, requireOrgRole } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const organizationId = event.context.params?.id
  if (!organizationId || typeof organizationId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  await requireOrgRole(sessionUser.id!, organizationId, ["owner"])

  await db.userOrganizationMembership.deleteMany({
    where: { organizationId },
  })

  await db.organization.delete({
    where: { id: organizationId },
  })

  return { message: "Organization deleted successfully", organizationId }
})
