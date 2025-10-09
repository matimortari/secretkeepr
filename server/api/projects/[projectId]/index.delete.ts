import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const projectId = getRouterParam(event, "projectId")
  if (!projectId) {
    throw createError({ statusCode: 400, message: "Project ID is required" })
  }

  await requireProjectRole(sessionUser.id, projectId, ["owner"])

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      orgId: true,
      members: {
        select: { userId: true },
      },
      secrets: {
        select: { id: true, key: true },
      },
    },
  })
  if (!project) {
    throw createError({ statusCode: 404, message: "Project not found" })
  }

  await createAuditLog({
    userId: sessionUser.id,
    orgId: project.orgId,
    action: "delete",
    resource: "project",
    metadata: {
      projectId: project.id,
      projectName: project.name,
      projectSlug: project.slug,
      memberCount: project.members.length,
      secretCount: project.secrets.length,
      secrets: project.secrets.map(s => ({ id: s.id, key: s.key })),
    },
    req: event.node.req,
  })

  await db.project.delete({
    where: { id: projectId },
  })

  return { success: true, message: "Project deleted successfully" }
})
