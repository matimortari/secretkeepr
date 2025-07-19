import db from "~/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  const userId = event.context.params?.member
  if (!userId || typeof userId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "User ID is required" })
  }
  if (sessionUser.id === userId) {
    throw createError({ statusCode: 403, statusMessage: "You cannot modify your own project membership" })
  }

  await requireProjectRole(sessionUser.id!, projectId, ["owner", "admin"])

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" })
  }

  await db.projectMember.delete({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    organizationId: project.organizationId,
    action: "project.member.remove",
    resource: `Project:${projectId}`,
    metadata: {
      removedUserId: userId,
    },
    req: event.node.req,
  })

  return { message: "User removed from project", userId }
})
