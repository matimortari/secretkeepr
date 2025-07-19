import db from "~/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const userId = event.context.params?.id
  if (!userId || typeof userId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "User ID is required" })
  }

  const body = await readBody(event)
  if (!body.role || !["owner", "admin", "member"].includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: "Valid role is required" })
  }

  const organizationId = body.organizationId || event.context.query.organizationId
  if (!organizationId || typeof organizationId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  const currentMembership = await requireOrgRole(sessionUser.id!, organizationId, ["owner", "admin"])

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

  // Prevent demoting the last owner
  if (targetMembership.role === "owner" && body.role !== "owner") {
    const ownerCount = await db.userOrganizationMembership.count({
      where: {
        organizationId,
        role: "owner",
      },
    })
    if (ownerCount <= 1) {
      throw createError({ statusCode: 400, statusMessage: "Cannot demote the last remaining owner" })
    }
  }
  if (userId === sessionUser.id && currentMembership.role !== "owner") {
    throw createError({ statusCode: 403, statusMessage: "Access denied: only owners can change their own role" })
  }

  const updatedMembership = await db.userOrganizationMembership.update({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    data: {
      role: body.role,
    },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    organizationId,
    action: "organization.member.role.update",
    resource: `User:${userId}`,
    metadata: {
      role: body.role,
    },
    req: event.node.req,
  })

  return { message: "User organization role updated", updatedMembership }
})
