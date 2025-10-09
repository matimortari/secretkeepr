import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireOrgRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const orgId = getRouterParam(event, "orgId")
  const memberId = getRouterParam(event, "memberId")
  if (!orgId) {
    throw createError({ statusCode: 400, message: "Organization ID is required" })
  }
  if (!memberId) {
    throw createError({ statusCode: 400, message: "Member ID is required" })
  }

  await requireOrgRole(sessionUser.id, orgId, ["owner", "admin"])

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
    throw createError({ statusCode: 403, message: "You cannot remove yourself from the organization" })
  }

  // Check if there would be no owners left after removal
  if (existingMembership.role === "owner") {
    const otherOwners = await db.organizationMembership.count({
      where: {
        orgId,
        role: "owner",
        userId: { not: memberId },
      },
    })
    if (otherOwners === 0) {
      throw createError({ statusCode: 409, message: "Cannot remove member: this user is the last owner of the organization" })
    }
  }

  // When removing a member from an organization, also remove them from all projects within that organization to maintain data integrity
  await db.$transaction(async (tx) => {
    await tx.projectMembership.deleteMany({
      where: {
        userId: memberId,
        project: {
          orgId,
        },
      },
    })

    await tx.organizationMembership.delete({
      where: {
        userId_orgId: {
          userId: memberId,
          orgId,
        },
      },
    })

    // If the user had this org as their active org, clear it
    await tx.user.updateMany({
      where: {
        id: memberId,
        activeOrgId: orgId,
      },
      data: {
        activeOrgId: null,
      },
    })
  })

  await createAuditLog({
    userId: sessionUser.id,
    orgId,
    action: "delete",
    resource: "organization_membership",
    metadata: {
      organizationId: orgId,
      organizationName: organization.name,
      targetUserId: memberId,
      targetUserEmail: existingMembership.user.email,
      targetUserName: existingMembership.user.name,
      removedRole: existingMembership.role,
      removedAt: new Date().toISOString(),
    },
    req: event.node.req,
  })

  return {
    message: "Member removed from organization successfully",
    removedMember: {
      id: memberId,
      name: existingMembership.user.name,
      email: existingMembership.user.email,
      role: existingMembership.role,
      organizationId: orgId,
    },
  }
})
