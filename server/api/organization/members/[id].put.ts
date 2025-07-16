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

  const body = await readBody(event)
  if (!body.role || !["owner", "admin", "member"].includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: "Valid role is required" })
  }

  const membership = await db.userOrganizationMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: sessionUser.id!,
        organizationId,
      },
    },
  })
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not an organization member" })
  }

  const targetMembership = await db.userOrganizationMembership.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: membership.organizationId,
      },
    },
  })
  if (!targetMembership) {
    throw createError({ statusCode: 404, statusMessage: "Target user not in this organization" })
  }
  if (membership.role !== "owner" && membership.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Access denied: insufficient permissions" })
  }

  // Prevent demoting the last owner
  if (targetMembership.role === "owner" && body.role !== "owner") {
    const ownerCount = await db.userOrganizationMembership.count({
      where: {
        organizationId: membership.organizationId,
        role: "owner",
      },
    })
    if (ownerCount <= 1) {
      throw createError({ statusCode: 400, statusMessage: "Cannot demote the last remaining owner" })
    }
  }
  if (userId === sessionUser.id && membership.role !== "owner") {
    throw createError({ statusCode: 403, statusMessage: "You cannot change your own role unless you are an owner" })
  }

  const updatedMembership = await db.userOrganizationMembership.update({
    where: {
      userId_organizationId: {
        userId: userId!,
        organizationId: membership.organizationId,
      },
    },
    data: {
      role: body.role,
    },
  })

  await db.auditLog.create({
    data: {
      userId: sessionUser.id!,
      action: "organization.member.role.update",
      resource: `User:${userId}`,
      metadata: {
        role: body.role,
        ip: event.node.req.headers["x-forwarded-for"] || event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    },
  })

  return { message: "User organization role updated", updatedMembership }
})
