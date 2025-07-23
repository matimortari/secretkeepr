import db from "~~/server/lib/db"
import { decrypt } from "~~/server/lib/encryption"
import { getUserFromSession, requireProjectRole } from "~~/server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  await requireProjectRole(sessionUser.id!, projectId, ["admin", "owner", "member"])

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      secrets: {
        include: {
          values: true,
        },
      },
    },
  })
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project not found" })
  }

  const decryptedSecrets = project.secrets.map(secret => ({
    ...secret,
    values: secret.values.map(v => ({
      ...v,
      value: decrypt(v.value),
    })),
  }))

  return {
    secrets: decryptedSecrets,
  }
})
