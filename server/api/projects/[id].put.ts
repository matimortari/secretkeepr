import db from "~/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  const body = await readBody(event)
  if (!body.name || typeof body.name !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project name is required" })
  }

  await requireProjectRole(sessionUser.id!, projectId, ["admin", "owner"])

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" })
  }

  const updatedProject = await db.project.update({
    where: { id: projectId },
    data: {
      name: body.name,
      description: body.description || null,
    },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    organizationId: project.organizationId,
    action: "project.update",
    resource: `Project:${projectId}`,
    metadata: {
      newName: body.name,
      newDescription: body.description || null,
    },
    req: event.node.req,
  })

  return { message: "Project updated successfully", updatedProject }
})
