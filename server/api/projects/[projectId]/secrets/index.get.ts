import db from "#server/lib/db"
import { decrypt } from "#server/lib/encryption"
import { getUserFromSession, requireProjectRole } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)
  const projectId = getRouterParam(event, "projectId")
  if (!projectId) {
    throw createError({ statusCode: 400, message: "Project ID is required" })
  }

  await requireProjectRole(sessionUser.id, projectId, ["owner", "admin", "member"])

  const query = getQuery(event)
  const environment = query.environment as string

  // Base where clause for secrets
  const whereClause: any = {
    projectId,
  }

  const secrets = await db.secret.findMany({
    where: whereClause,
    include: {
      values: {
        where: environment ? { environment: environment as any } : undefined,
        orderBy: { environment: "asc" },
      },
    },
    orderBy: { key: "asc" },
  })

  const decryptedSecrets = secrets.map(secret => ({
    id: secret.id,
    key: secret.key,
    description: secret.description,
    createdAt: secret.createdAt,
    updatedAt: secret.updatedAt,
    values: secret.values.map((value: any) => ({
      environment: value.environment,
      value: decrypt(value.value),
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    })),
  }))

  return { secrets: decryptedSecrets }
})
