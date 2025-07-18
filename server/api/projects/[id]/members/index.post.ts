import db from "~/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "~/lib/utils"

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

  await requireProjectRole(sessionUser.id!, projectId, ["owner", "admin"])

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

  await createAuditLog({
    userId: sessionUser.id!,
    action: "project.member.add",
    resource: `Project:${projectId}`,
    metadata: {
      addedUserId: body.userId,
      addedUserRole: body.role,
    },
    req: event.node.req,
  })

  return { message: "User added to project", newUser }
})
