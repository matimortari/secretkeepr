import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const secretId = event.context.params?.id
  if (!secretId || typeof secretId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Secret ID is required" })
  }

  const secret = await db.secret.findUnique({
    where: { id: secretId },
    include: { project: true },
  })
  if (!secret) {
    throw createError({ statusCode: 404, statusMessage: "Secret not found" })
  }

  const membership = await db.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: sessionUser.id!,
        projectId: secret.projectId,
      },
    },
    select: {
      role: true,
    },
  })
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not a project member" })
  }
  if (membership.role !== "admin" && membership.role !== "owner") {
    throw createError({ statusCode: 403, statusMessage: "Access denied: insufficient permissions" })
  }

  await db.secret.delete({
    where: { id: secretId },
  })

  await db.auditLog.create({
    data: {
      userId: sessionUser.id!,
      action: "secret.delete",
      resource: `Secret:${secretId}`,
      metadata: {
        secretKey: secret.key,
        projectId: secret.projectId,
        ip: event.node.req.headers["x-forwarded-for"] || event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    },
  })

  return { message: "Secret deleted successfully", secretId }
})
