import db from "~/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const projectId = event.context.params?.id

  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  await requireProjectRole(sessionUser.id!, projectId, ["owner"])

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" })
  }

  await db.project.delete({
    where: { id: projectId },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    organizationId: project.organizationId,
    action: "project.delete",
    resource: `Project:${projectId}`,
    metadata: {},
    req: event.node.req,
  })

  return { message: "Project deleted successfully", projectId }
})
