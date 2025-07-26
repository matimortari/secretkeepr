import db from "~~/server/lib/db"
import { encrypt } from "~~/server/lib/encryption"
import { createAuditLog, getUserFromSession, requireProjectRole } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
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

  await requireProjectRole(sessionUser.id!, projectId, ["admin", "owner"])

  const filteredValues = body.values.filter((v: { environment: Environment, value: string }) => v.value.trim() !== "")
  if (filteredValues.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "At least one secret value is required" })
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { orgId: true },
  })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" })
  }

  const newSecret = await db.secret.create({
    data: {
      key: body.key,
      description: body.description,
      projectId,
      values: {
        create: filteredValues.map((v: { environment: Environment, value: string }) => ({
          environment: v.environment,
          value: encrypt(v.value.trim()),
        })),
      },
    },
    include: {
      values: true,
    },
  })

  await createAuditLog({
    userId: sessionUser.id!,
    orgId: project.orgId,
    action: "secret.create",
    resource: `Project: ${projectId}`,
    metadata: {
      key: newSecret.key,
      description: newSecret.description || null,
      values: newSecret.values.map(v => ({
        environment: v.environment,
        value: v.value,
      })),
    },
    req: event.node.req,
  })

  return { message: "Secret created successfully", newSecret }
})
