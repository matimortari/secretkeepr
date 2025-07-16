import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
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

  await db.project.delete({
    where: { id: projectId },
  })

  await db.auditLog.create({
    data: {
      userId: sessionUser.id!,
      action: "project.delete",
      resource: `Project:${projectId}`,
      metadata: {
        ip: event.node.req.headers["x-forwarded-for"] || event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    },
  })

  return { message: "Project deleted successfully", projectId }
})
