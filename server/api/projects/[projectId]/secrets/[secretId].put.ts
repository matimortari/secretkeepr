import db from "#server/lib/db"
import { encrypt } from "#server/lib/encryption"
import { createAuditLog, getUserFromSession, requireProjectRole } from "#server/lib/utils"
import { updateSecretSchema } from "#shared/schemas/secret"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const projectId = getRouterParam(event, "projectId")
  const secretId = getRouterParam(event, "secretId")
  const body = await readBody(event)
  if (!projectId) {
    throw createError({ statusCode: 400, message: "Project ID is required" })
  }
  if (!secretId) {
    throw createError({ statusCode: 400, message: "Secret ID is required" })
  }

  await requireProjectRole(sessionUser.id, projectId, ["owner", "admin"])

  const { description, values } = updateSecretSchema.parse(body)

  const existingSecret = await db.secret.findFirst({
    where: {
      id: secretId,
      projectId,
    },
    include: {
      project: {
        select: { orgId: true, name: true },
      },
      values: true,
    },
  })
  if (!existingSecret) {
    throw createError({
      statusCode: 404,
      message: "Secret not found",
    })
  }

  const updatedSecret = await db.$transaction(async (tx) => {
    let secret
    if (description !== undefined) {
      secret = await tx.secret.update({
        where: { id: secretId },
        data: { description },
        include: {
          values: true,
        },
      })
    }
    else {
      secret = await tx.secret.findUnique({
        where: { id: secretId },
        include: {
          values: true,
        },
      })
    }

    // If values are provided, replace all existing values
    if (values && values.length > 0) {
      await tx.secretValue.deleteMany({
        where: { secretId },
      })

      await tx.secretValue.createMany({
        data: values.map(val => ({
          secretId,
          environment: val.environment,
          value: encrypt(val.value),
        })),
      })

      return await tx.secret.findUnique({
        where: { id: secretId },
        include: {
          values: true,
        },
      })
    }

    return secret
  })
  if (!updatedSecret) {
    throw createError({ statusCode: 500, message: "Failed to update secret" })
  }

  await createAuditLog({
    userId: sessionUser.id,
    orgId: existingSecret.project.orgId,
    action: "update",
    resource: "secret",
    metadata: {
      secretId,
      secretKey: existingSecret.key,
      projectId,
      projectName: existingSecret.project.name,
      updatedFields: {
        description: description !== undefined,
        values: values !== undefined,
      },
      environments: values?.map(v => v.environment) || [],
    },
    req: event.node.req,
  })

  return {
    id: updatedSecret.id,
    key: updatedSecret.key,
    description: updatedSecret.description,
    createdAt: updatedSecret.createdAt,
    updatedAt: updatedSecret.updatedAt,
    values: updatedSecret.values.map((value: any) => ({
      environment: value.environment,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    })),
  }
})
