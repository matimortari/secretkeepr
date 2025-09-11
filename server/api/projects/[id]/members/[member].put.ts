import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.member
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  const memberId = event.context.params?.member
  if (!memberId || typeof memberId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Member ID is required" })
  }
  if (sessionUser.id === memberId) {
    throw createError({ statusCode: 403, statusMessage: "You cannot modify your own project membership" })
  }

  const body = await readBody(event)
  if (!body.role || !["admin", "member"].includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: "Valid role is required" })
  }

  await requireProjectRole(sessionUser.id!, projectId, ["owner", "admin"])

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { orgId: true },
  })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" })
  }

  const updatedMember = await db.projectMembership.update({
    where: {
      userId_projectId: {
        userId: memberId,
        projectId,
      },
    },
    data: { role: body.role },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      },
    },
  })

  await createAuditLog({
    memberId: sessionUser.id!,
    orgId: project.orgId,
    action: "project.member.update",
    resource: `Project: ${projectId}`,
    metadata: {
      id: updatedMember.userId,
      newRole: updatedMember.role,
    },
    req: event.node.req,
  })

  return { message: "User project role updated", updatedMember }
})
