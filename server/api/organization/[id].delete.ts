import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const organizationId = event.context.params?.id
  if (!organizationId || typeof organizationId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  const membership = await db.userOrganizationMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: sessionUser.id!,
        organizationId,
      },
    },
    select: {
      role: true,
    },
  })
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not an organization member" })
  }
  if (membership.role !== "owner" && membership.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Access denied: insufficient permissions" })
  }

  await db.userOrganizationMembership.deleteMany({
    where: { organizationId },
  })

  await db.organization.delete({
    where: { id: organizationId },
  })

  return { message: "Organization deleted successfully", organizationId }
})
