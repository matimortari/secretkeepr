import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
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

  await requireProjectRole(sessionUser.id!, projectId, ["owner", "admin"])

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { orgId: true },
  })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" })
  }

  const member = await db.projectMembership.findUnique({
    where: { userId_projectId: { userId: memberId, projectId } },
  })
  if (!member) {
    throw createError({ statusCode: 404, statusMessage: "Project member not found" })
  }
  if (member.role === "owner") {
    throw createError({ statusCode: 403, statusMessage: "You cannot remove the project owner" })
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
    userId: sessionUser.id!,
    orgId: project.orgId,
    action: "project.member.remove",
    resource: `Project: ${projectId}`,
    metadata: {
      id: memberId,
    },
    req: event.node.req,
  })

  return { message: "User removed from project", userId: memberId }
})
