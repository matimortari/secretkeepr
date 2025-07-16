import db from "~/lib/db"
import { encrypt } from "~/lib/encryption"
import { getUserFromSession } from "~/lib/utils"

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

  const membership = await db.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: sessionUser.id!,
        projectId,
      },
    },
    select: {
      role: true,
    },
  })
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not a project member" })
  }
  if (membership.role !== "admin" && membership.role !== "owner") {
    throw createError({ statusCode: 403, statusMessage: "Access denied: insufficient permissions" })
  }

  const filteredValues = body.values.filter((v: { environment: Environment, value: string }) => v.value.trim() !== "")
  if (filteredValues.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "At least one secret value is required" })
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

  await db.auditLog.create({
    data: {
      userId: sessionUser.id!,
      action: "secret.create",
      resource: `Project:${projectId}`,
      metadata: {
        secretKey: body.key,
        description: body.description || null,
        environments: filteredValues.map((v: { environment: Environment }) => v.environment),
        ip: event.node.req.headers["x-forwarded-for"] || event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    },
  })

  return { message: "Secret created successfully", newSecret }
})
