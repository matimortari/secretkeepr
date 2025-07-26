import db from "~~/server/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const userId = event.context.params?.id
  if (!userId || typeof userId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "User ID is required" })
  }

  const body = await readBody(event)
  if (!body.role || !["admin", "member"].includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: "Valid role is required" })
  }

  const orgId = body.orgId || event.context.query.orgId
  if (!orgId || typeof orgId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Organization ID is required" })
  }

  const currentMembership = await requireOrgRole(sessionUser.id!, orgId, ["owner", "admin"])

  const targetMembership = await db.userOrganizationMembership.findUnique({
    where: {
      userId_orgId: {
        userId,
        orgId,
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
        orgId,
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
      userId_orgId: {
        userId,
        orgId,
      },
    },
    data: {
      role: body.role,
    },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    orgId,
    action: "org.member.update",
    resource: `User: ${userId}`,
    metadata: {
      role: updatedMembership.role,
    },
    req: event.node.req,
  })

  return { message: "User organization role updated", updatedMembership }
})
