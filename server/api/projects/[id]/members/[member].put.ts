import db from "~~/server/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "~~/server/lib/utils"

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

  const body = await readBody(event)
  if (!body.role || !["owner", "admin", "member"].includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: "Valid role is required" })
  }

  await requireProjectRole(sessionUser.id!, projectId, ["owner", "admin"])

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" })
  }

  const updatedUser = await db.projectMember.update({
    where: {
      userId_projectId: {
        userId,
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
    userId: sessionUser.id!,
    organizationId: project.organizationId,
    action: "project.member.update",
    resource: `Project: ${projectId}`,
    metadata: {
      id: updatedUser.userId,
      newRole: updatedUser.role,
    },
    req: event.node.req,
  })

  return { message: "User project role updated", updatedUser }
})
