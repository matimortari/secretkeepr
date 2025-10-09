import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "#server/lib/utils"
import { updateProjectMemberSchema } from "#shared/schemas/project"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const projectId = getRouterParam(event, "projectId")
  const memberId = getRouterParam(event, "memberId")
  const body = await readBody(event)
  if (!projectId) {
    throw createError({ statusCode: 400, message: "Project ID is required" })
  }
  if (!memberId) {
    throw createError({ statusCode: 400, message: "Member ID is required" })
  }

  await requireProjectRole(sessionUser.id, projectId, ["owner", "admin"])

  const { role } = updateProjectMemberSchema.parse(body)

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
    throw createError({ statusCode: 403, message: "You cannot change your own role" })
  }

  // Check if there would be no owners left after the role change
  if (existingMembership.role === "owner" && role !== "owner") {
    const otherOwners = await db.projectMembership.count({
      where: {
        projectId,
        role: "owner",
        userId: { not: memberId },
      },
    })
    if (otherOwners === 0) {
      throw createError({ statusCode: 409, message: "Cannot change role: this user is the last owner of the project" })
    }
  }

  const updatedMembership = await db.projectMembership.update({
    where: {
      userId_projectId: {
        userId: memberId,
        projectId,
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
    orgId: project.orgId,
    action: "update",
    resource: "project_membership",
    metadata: {
      projectId,
      projectName: project.name,
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
