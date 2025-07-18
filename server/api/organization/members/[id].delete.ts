import db from "~/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const userId = event.context.params?.id
  if (!userId || typeof userId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "User ID is required" })
  }

  const organizationId = event.context.params?.organizationId
  if (!organizationId || typeof organizationId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  const isSelf = sessionUser.id === userId

  const actingMembership = await requireOrgRole(sessionUser.id!, organizationId, ["owner"])

  const targetMembership = await db.userOrganizationMembership.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  })
  if (!targetMembership) {
    throw createError({ statusCode: 404, statusMessage: "Target user not in this organization" })
  }

  // If self-removal and last owner, prevent user from leaving
  if (isSelf && actingMembership.role === "owner") {
    const otherOwners = await db.userOrganizationMembership.findMany({
      where: {
        organizationId,
        role: "owner",
        NOT: {
          userId: sessionUser.id!,
        },
      },
    })
    if (otherOwners.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "You cannot leave the organization as the last owner. Please delete the organization instead.",
      })
    }
  }

  await db.userOrganizationMembership.delete({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    action: isSelf ? "organization.member.leave" : "organization.member.remove",
    resource: `User:${userId}`,
    metadata: {
      organizationId,
      removedUserId: userId,
      actingUserRole: actingMembership.role,
    },
    req: event.node.req,
  })

  return {
    message: isSelf
      ? "You have left the organization"
      : "User removed from organization",
    userId,
  }
})
