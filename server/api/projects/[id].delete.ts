import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  await requireProjectRole(sessionUser.id!, projectId, ["owner"])

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { orgId: true },
  })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" })
  }

  await db.project.delete({
    where: { id: projectId },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    orgId: project.orgId,
    action: "project.delete",
    resource: `Project: ${projectId}`,
    metadata: {
      id: projectId,
    },
    req: event.node.req,
  })

  return { message: "Project deleted successfully", projectId }
})
