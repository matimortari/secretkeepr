import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "#server/lib/utils"
import { updateProjectSchema } from "#shared/schemas/project"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const projectId = getRouterParam(event, "projectId")
  const body = await readBody(event)
  if (!projectId) {
    throw createError({ statusCode: 400, message: "Project ID is required" })
  }

  const { name, description } = updateProjectSchema.parse(body)

  await requireProjectRole(sessionUser.id, projectId, ["owner", "admin"])

  const existingProject = await db.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      description: true,
      orgId: true,
    },
  })
  if (!existingProject) {
    throw createError({ statusCode: 404, message: "Project not found" })
  }

  const project = await db.project.update({
    where: { id: projectId },
    data: { name, description },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (Object.keys({ name, description }).length > 0) {
    await createAuditLog({
      userId: sessionUser.id,
      orgId: existingProject.orgId,
      action: "update",
      resource: "project",
      metadata: {
        projectId,
        changes: { name, description },
        previousData: {
          name: existingProject.name,
          description: existingProject.description,
        },
      },
      req: event.node.req,
    })
  }

  return project
})
