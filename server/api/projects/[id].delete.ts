import db from "~/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const projectId = event.context.params?.id

  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  await requireProjectRole(sessionUser.id!, projectId, ["admin", "owner"])

  await db.project.delete({
    where: { id: projectId },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    action: "project.delete",
    resource: `Project:${projectId}`,
    metadata: {},
    req: event.node.req,
  })

  return { message: "Project deleted successfully", projectId }
})
