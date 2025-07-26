import db from "~~/server/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const query = getQuery(event)
  const orgId = query.orgId
  if (!orgId || typeof orgId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  const memberId = event.context.params?.id
  if (!memberId || typeof memberId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Member ID is required" })
  }

  const membership = await requireOrgRole(sessionUser.id!, orgId, ["owner", "admin", "member"])

  const isSelfRemoval = sessionUser.id === memberId
  if (isSelfRemoval) {
    if (membership.role === "owner") {
      throw createError({ statusCode: 400, statusMessage: "Owners cannot leave the organization. Please delete the organization instead." })
    }
  }
  else {
    await requireOrgRole(sessionUser.id!, orgId, ["owner"])
  }

  await db.userOrganizationMembership.delete({
    where: {
      userId_orgId: {
        userId: memberId,
        orgId,
      },
    },
  })

  if (!isSelfRemoval) {
    await createAuditLog({
      userId: sessionUser.id!,
      orgId,
      action: "org.member.remove",
      resource: `User: ${memberId}`,
      metadata: {
        ID: memberId,
      },
      req: event.node.req,
    })
  }

  if (isSelfRemoval) {
    await createAuditLog({
      userId: sessionUser.id!,
      orgId,
      action: "org.member.leave",
      resource: `User: ${memberId}`,
      metadata: {
        id: memberId,
      },
      req: event.node.req,
    })
  }

  return {
    message: isSelfRemoval ? "You have successfully left the organization" : "Member removed successfully",
    userId: memberId,
  }
})
