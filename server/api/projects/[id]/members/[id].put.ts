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

  const body = await readBody(event)
  if (!body.role || !["owner", "admin", "member"].includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: "Valid role is required" })
  }

  await requireProjectRole(sessionUser.id!, projectId, ["owner", "admin"])

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
    action: "project.member.add",
    resource: `Project:${projectId}`,
    metadata: {
      addedUserId: body.userId,
      addedUserRole: body.role,
    },
    req: event.node.req,
  })

  return { message: "User project role updated", updatedUser }
})
