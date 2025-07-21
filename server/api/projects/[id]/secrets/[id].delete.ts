import db from "~/lib/db"
import { createAuditLog, getUserFromSession, requireProjectRole } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const secretId = event.context.params?.id
  if (!secretId || typeof secretId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Secret ID is required" })
  }

  const secret = await db.secret.findUnique({
    where: { id: secretId },
    include: {
      project: true,
      values: true,
    },
  })
  if (!secret) {
    throw createError({ statusCode: 404, statusMessage: "Secret not found" })
  }

  await requireProjectRole(sessionUser.id!, secret.projectId, ["admin", "owner"])

  await db.secret.delete({
    where: { id: secretId },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    organizationId: secret.project.organizationId,
    action: "secret.delete",
    resource: `Secret: ${secretId}`,
    metadata: {
      id: secretId,
      projectId: secret.projectId,
      key: secret.key,
      values: secret.values.map(v => ({
        environment: v.environment,
        value: v.value,
      })),
    },
    req: event.node.req,
  })

  return { message: "Secret deleted successfully", secretId }
})
