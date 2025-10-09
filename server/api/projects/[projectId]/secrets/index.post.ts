import db from "#server/lib/db"
import { encrypt } from "#server/lib/encryption"
import { createAuditLog, getUserFromSession, requireProjectRole } from "#server/lib/utils"
import { createSecretSchema } from "#shared/schemas/secret"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const projectId = getRouterParam(event, "projectId")
  const body = await readBody(event)
  if (!projectId) {
    throw createError({ statusCode: 400, message: "Project ID is required" })
  }

  await requireProjectRole(sessionUser.id, projectId, ["owner", "admin"])

  const { key, description, values } = createSecretSchema.parse(body)

  const existingSecret = await db.secret.findUnique({
    where: {
      key_projectId: {
        key,
        projectId,
      },
    },
  })
  if (existingSecret) {
    throw createError({ statusCode: 409, message: "A secret with this key already exists in the project" })
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { orgId: true, name: true },
  })
  if (!project) {
    throw createError({ statusCode: 404, message: "Project not found" })
  }

  const secret = await db.secret.create({
    data: {
      key,
      description,
      projectId,
      values: {
        create: values.map(val => ({
          environment: val.environment,
          value: encrypt(val.value),
        })),
      },
    },
    include: {
      values: true,
    },
  })

  await createAuditLog({
    userId: sessionUser.id,
    orgId: project.orgId,
    action: "create",
    resource: "secret",
    metadata: {
      secretId: secret.id,
      secretKey: key,
      projectId,
      projectName: project.name,
      environments: values.map(v => v.environment),
    },
    req: event.node.req,
  })

  return {
    id: secret.id,
    key: secret.key,
    description: secret.description,
    createdAt: secret.createdAt,
    updatedAt: secret.updatedAt,
    values: secret.values.map((value: any) => ({
      environment: value.environment,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    })),
  }
})
