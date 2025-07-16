import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

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

  const membership = await db.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: sessionUser.id!,
        projectId,
      },
    },
  })
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not a project member" })
  }
  if (membership.role !== "admin" && membership.role !== "owner") {
    throw createError({ statusCode: 403, statusMessage: "Access denied: insufficient permissions" })
  }

  await db.projectMember.delete({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  })

  await db.auditLog.create({
    data: {
      userId: sessionUser.id!,
      action: "project.member.remove",
      resource: `Project:${projectId}`,
      metadata: {
        removedUserId: userId,
        ip: event.node.req.headers["x-forwarded-for"] || event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    },
  })

  return { message: "User removed from project", userId }
})
