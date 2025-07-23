import db from "~~/server/lib/db"
import { getUserFromSession, requireProjectRole } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  await requireProjectRole(sessionUser.id!, projectId, ["owner", "admin", "member"])

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
