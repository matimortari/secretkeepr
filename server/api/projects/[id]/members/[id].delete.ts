import db from "~/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  const userId = event.context.params?.memberId
  if (!userId || typeof userId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "User ID is required" })
  }

  await requireProjectRole(sessionUser.id!, projectId, ["owner", "admin"])

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
    action: "project.member.remove",
    resource: `Project:${projectId}`,
    metadata: {
      removedUserId: userId,
    },
    req: event.node.req,
  })

  return { message: "User removed from project", userId }
})
