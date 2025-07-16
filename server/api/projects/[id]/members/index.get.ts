import db from "~/lib/db"
import { getUserFromSession } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  const membership = await db.projectMember.findUnique({
    where: { userId_projectId: {
      userId: sessionUser.id!,
      projectId,
    } },
  })
  if (!membership || (membership.role !== "admin" && membership.role !== "owner")) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: insufficient permissions" })
  }

  const members = await db.projectMember.findMany({
    where: { projectId },
    select: {
      id: true,
      role: true,
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

  return members
})
