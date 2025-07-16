import db from "~/lib/db"
import { encrypt } from "~/lib/encryption"
import { getUserFromSession } from "~/lib/utils"

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

  if (body.values) {
    for (const val of body.values) {
      if (
        typeof val.environment !== "string"
        || !["development", "staging", "production"].includes(val.environment)
        || typeof val.value !== "string"
      ) {
        throw createError({ statusCode: 400, statusMessage: "Invalid secret value entry" })
      }
    }
  }

  const secret = await db.secret.findUnique({
    where: { id: secretId },
    include: { project: true },
  })
  if (!secret) {
    throw createError({ statusCode: 404, statusMessage: "Secret not found" })
  }

  const membership = await db.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: sessionUser.id!,
        projectId: secret.projectId,
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

  const updatedSecret = await db.secret.update({
    where: { id: secretId },
    data: {
      key: body.key ?? secret.key,
      description: typeof body.description === "string" ? body.description : secret.description,
    },
  })

  if (body.values) {
    await db.secretValue.deleteMany({
      where: { secretId },
    })

    await db.secretValue.createMany({
      data: body.values.map((v: { environment: string, value: string }) => ({
        secretId,
        environment: v.environment,
        value: encrypt(v.value),
      })),
      skipDuplicates: true,
    })
  }

  await db.auditLog.create({
    data: {
      userId: sessionUser.id!,
      action: "secret.update",
      resource: `Secret:${secretId}`,
      metadata: {
        updatedKey: body.key || secret.key,
        updatedDescription: body.description || secret.description,
        environments: body.values ? body.values.map((v: { environment: string }) => v.environment) : [],
        ip: event.node.req.headers["x-forwarded-for"] || event.node.req.socket.remoteAddress,
        userAgent: event.node.req.headers["user-agent"],
      },
    },
  })

  return { message: "Secret updated successfully", updatedSecret }
})
