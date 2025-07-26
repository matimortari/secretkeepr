import db from "~~/server/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "~~/server/lib/utils"

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
    select: { orgId: true },
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
    orgId: project.orgId,
    action: "project.update",
    resource: `Project: ${projectId}`,
    metadata: {
      newName: updatedProject.name,
      newDescription: updatedProject.description || null,
    },
    req: event.node.req,
  })

  return { message: "Project updated successfully", updatedProject }
})
