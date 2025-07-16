import db from "~/lib/db"
import { decrypt } from "~/lib/encryption"
import { getUserFromSession } from "~/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projectId = event.context.params?.id
  if (!projectId || typeof projectId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Project ID is required" })
  }

  const membership = await db.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: sessionUser.id!,
        projectId,
      },
    },
  })
  if (!membership) {
    throw createError({ statusCode: 403, statusMessage: "Access denied: not a project member" })
  }

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
