import db from "~~/server/lib/db"
import { encrypt } from "~~/server/lib/encryption"
import { createAuditLog, getUserFromSession, requireProjectRole } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const secretId = event.context.params?.id
  if (!secretId || typeof secretId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Secret ID is required" })
  }

  const body = await readBody(event)
  if (typeof body.key !== "string" || body.key.trim() === "") {
    throw createError({ statusCode: 400, statusMessage: "Secret key is required" })
  }
  if (body.description && typeof body.description !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Description must be a string" })
  }
  if (!body.values || !Array.isArray(body.values)) {
    throw createError({ statusCode: 400, statusMessage: "Secret values must be an array" })
  }

  for (const val of body.values) {
    if (
      typeof val.environment !== "string"
      || !["development", "staging", "production"].includes(val.environment)
      || typeof val.value !== "string"
    ) {
      throw createError({ statusCode: 400, statusMessage: "Invalid secret value entry" })
    }
  }

  const secret = await db.secret.findUnique({
    where: { id: secretId },
    include: { project: true },
  })
  if (!secret) {
    throw createError({ statusCode: 404, statusMessage: "Secret not found" })
  }

  await requireProjectRole(sessionUser.id!, secret.projectId, ["admin", "owner"])

  const updatedSecret = await db.secret.update({
    where: { id: secretId },
    data: {
      key: body.key || secret.key,
      description: body.description || secret.description,
      values: {
        deleteMany: {}, // Remove all previous values
        create: body.values.map((v: { environment: Environment, value: string }) => ({
          environment: v.environment,
          value: encrypt(v.value.trim()),
        })),
      },
    },
    include: { values: true },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    organizationId: secret.project.organizationId,
    action: "secret.update",
    resource: `Secret: ${secretId}`,
    metadata: {
      key: updatedSecret.key,
      description: updatedSecret.description || null,
      values: updatedSecret.values.map(v => ({
        environment: v.environment,
        value: v.value,
      })),
    },
    req: event.node.req,
  })

  return { message: "Secret updated successfully", updatedSecret }
})
