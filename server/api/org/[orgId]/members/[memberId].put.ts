import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "#server/lib/utils"
import { updateOrgMemberSchema } from "#shared/schemas/org"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const orgId = getRouterParam(event, "orgId")
  const memberId = getRouterParam(event, "memberId")
  const body = await readBody(event)
  if (!orgId) {
    throw createError({ statusCode: 400, message: "Organization ID is required" })
  }
  if (!memberId) {
    throw createError({ statusCode: 400, message: "Member ID is required" })
  }

  await requireOrgRole(sessionUser.id, orgId, ["owner", "admin"])

  const { role } = updateOrgMemberSchema.parse(body)

  const organization = await db.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true },
  })
  if (!organization) {
    throw createError({ statusCode: 404, message: "Organization not found" })
  }

  const existingMembership = await db.organizationMembership.findUnique({
    where: {
      userId_orgId: {
        userId: memberId,
        orgId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })
  if (!existingMembership) {
    throw createError({ statusCode: 404, message: "Member not found in this organization" })
  }
  if (memberId === sessionUser.id) {
    throw createError({ statusCode: 403, message: "You cannot change your own role" })
  }

  // Check if there would be no owners left after the role change
  if (existingMembership.role === "owner" && role !== "owner") {
    const otherOwners = await db.organizationMembership.count({
      where: {
        orgId,
        role: "owner",
        userId: { not: memberId },
      },
    })
    if (otherOwners === 0) {
      throw createError({ statusCode: 409, message: "Cannot change role: this user is the last owner of the organization" })
    }
  }

  const updatedMembership = await db.organizationMembership.update({
    where: {
      userId_orgId: {
        userId: memberId,
        orgId,
      },
    },
    data: { role },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  await createAuditLog({
    userId: sessionUser.id,
    orgId,
    action: "update",
    resource: "organization_membership",
    metadata: {
      organizationId: orgId,
      organizationName: organization.name,
      targetUserId: memberId,
      targetUserEmail: existingMembership.user.email,
      targetUserName: existingMembership.user.name,
      previousRole: existingMembership.role,
      newRole: role,
    },
    req: event.node.req,
  })

  return {
    id: updatedMembership.user.id,
    name: updatedMembership.user.name,
    email: updatedMembership.user.email,
    image: updatedMembership.user.image,
    role: updatedMembership.role,
    joinedAt: updatedMembership.createdAt,
  }
})
