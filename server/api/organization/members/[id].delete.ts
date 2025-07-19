import db from "~/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const query = getQuery(event)
  const organizationId = query.organizationId
  if (!organizationId || typeof organizationId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  const memberId = event.context.params?.id
  if (!memberId || typeof memberId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Member ID is required" })
  }

  const membership = await requireOrgRole(sessionUser.id!, organizationId, ["owner", "admin", "member"])

  const isSelfRemoval = sessionUser.id === memberId
  if (isSelfRemoval) {
    if (membership.role === "owner") {
      throw createError({ statusCode: 400, statusMessage: "Owners cannot leave the organization. Please delete the organization instead." })
    }
  }
  else {
    await requireOrgRole(sessionUser.id!, organizationId, ["owner"])
  }

  await db.userOrganizationMembership.delete({
    where: {
      userId_organizationId: {
        userId: memberId,
        organizationId,
      },
    },
  })

  if (!isSelfRemoval) {
    await createAuditLog({
      userId: sessionUser.id!,
      organizationId,
      action: "organization.member.remove",
      resource: `User:${memberId}`,
      metadata: {
        role: membership.role,
      },
      req: event.node.req,
    })
  }

  return {
    message: isSelfRemoval ? "You have successfully left the organization" : "Member removed successfully",
    userId: memberId,
  }
})
