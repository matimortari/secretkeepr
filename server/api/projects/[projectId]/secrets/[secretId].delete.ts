import db from "#server/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const projectId = getRouterParam(event, "projectId")
  const secretId = getRouterParam(event, "secretId")
  if (!projectId) {
    throw createError({ statusCode: 400, message: "Project ID is required" })
  }
  if (!secretId) {
    throw createError({ statusCode: 400, message: "Secret ID is required" })
  }

  await requireProjectRole(sessionUser.id, projectId, ["owner", "admin"])

  const existingSecret = await db.secret.findFirst({
    where: {
      id: secretId,
      projectId,
    },
    include: {
      project: {
        select: { orgId: true, name: true },
      },
      values: {
        select: { environment: true },
      },
    },
  })
  if (!existingSecret) {
    throw createError({
      statusCode: 404,
      message: "Secret not found",
    })
  }

  await db.secret.delete({
    where: { id: secretId },
  })

  await createAuditLog({
    userId: sessionUser.id,
    orgId: existingSecret.project.orgId,
    action: "delete",
    resource: "secret",
    metadata: {
      secretId,
      secretKey: existingSecret.key,
      projectId,
      projectName: existingSecret.project.name,
      environments: existingSecret.values.map(v => v.environment),
      deletedAt: new Date().toISOString(),
    },
    req: event.node.req,
  })

  return { success: true, message: "Secret deleted successfully", deletedSecret: { id: secretId, key: existingSecret.key, projectId } }
})
