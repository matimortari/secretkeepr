import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const projectId = getRouterParam(event, "projectId")
  const memberId = getRouterParam(event, "memberId")
  if (!projectId) {
    throw createError({ statusCode: 400, message: "Project ID is required" })
  }

  if (!memberId) {
    throw createError({ statusCode: 400, message: "Member ID is required" })
  }

  await requireProjectRole(sessionUser.id, projectId, ["owner", "admin"])

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      organization: {
        select: { id: true, name: true },
      },
    },
  })
  if (!project) {
    throw createError({ statusCode: 404, message: "Project not found" })
  }

  const existingMembership = await db.projectMembership.findUnique({
    where: {
      userId_projectId: {
        userId: memberId,
        projectId,
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
    throw createError({ statusCode: 404, message: "Member not found in this project" })
  }
  if (memberId === sessionUser.id) {
    throw createError({ statusCode: 403, message: "You cannot remove yourself from the project" })
  }

  // Check if there would be no owners left after removal
  if (existingMembership.role === "owner") {
    const otherOwners = await db.projectMembership.count({
      where: {
        projectId,
        role: "owner",
        userId: { not: memberId },
      },
    })
    if (otherOwners === 0) {
      throw createError({ statusCode: 409, message: "Cannot remove member: this user is the last owner of the project" })
    }
  }

  await db.projectMembership.delete({
    where: {
      userId_projectId: {
        userId: memberId,
        projectId,
      },
    },
  })

  await createAuditLog({
    userId: sessionUser.id,
    orgId: project.orgId,
    action: "delete",
    resource: "project_membership",
    metadata: {
      projectId,
      projectName: project.name,
      targetUserId: memberId,
      targetUserEmail: existingMembership.user.email,
      targetUserName: existingMembership.user.name,
      removedRole: existingMembership.role,
      removedAt: new Date().toISOString(),
    },
    req: event.node.req,
  })

  return {
    message: "Member removed from project successfully",
    removedMember: {
      id: memberId,
      name: existingMembership.user.name,
      email: existingMembership.user.email,
      role: existingMembership.role,
      projectId,
    },
  }
})
