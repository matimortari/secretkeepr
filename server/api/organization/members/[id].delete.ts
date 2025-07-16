import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

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

  const actingMembership = await db.userOrganizationMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: sessionUser.id!,
        organizationId,
      },
    },
  })
  if (!actingMembership) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not an organization member" })
  }

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

  const isSelf = sessionUser.id === userId
  if (!isSelf && actingMembership.role !== "owner" && actingMembership.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Access denied: insufficient permissions" })
  }

  // If self-removal and last owner, block user from leaving
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

  await db.auditLog.create({
    data: {
      userId: sessionUser.id!,
      action: isSelf ? "organization.member.leave" : "organization.member.remove",
      resource: `User:${userId}`,
      metadata: {
        organizationId,
        ip: event.node.req.headers["x-forwarded-for"] || event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    },
  })

  return {
    message: isSelf
      ? "You have left the organization"
      : "User removed from organization",
    userId,
  }
})
