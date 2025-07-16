import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  const body = await readBody(event)
  if (!body.userId || typeof body.userId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "User ID is required" })
  }
  if (!body.role || !["owner", "admin", "member"].includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: "Valid role is required" })
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

  const addedUser = await db.user.findUnique({
    where: { id: body.userId },
  })
  if (!addedUser) {
    throw createError({ statusCode: 404, statusMessage: "User not found" })
  }

  const newUser = await db.projectMember.create({
    data: {
      userId: body.userId,
      projectId,
      role: body.role,
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

  await db.auditLog.create({
    data: {
      userId: sessionUser.id!,
      action: "project.member.add",
      resource: `Project:${projectId}`,
      metadata: {
        addedUserId: body.userId,
        addedUserRole: body.role,
        ip: event.node.req.headers["x-forwarded-for"] || event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    },
  })

  return { message: "User added to project", newUser }
})
