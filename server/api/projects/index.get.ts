import db from "#server/lib/db"
import { decrypt } from "#server/lib/encryption"
import { getUserFromSession } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const projects = await db.project.findMany({
    where: {
      members: {
        some: {
          userId: sessionUser.id,
        },
      },
    },
    include: {
      secrets: {
        include: {
          values: true,
        },
      },
      members: {
        select: {
          role: true,
          userId: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      },

    },
  })

  const projectsWithDecryptedSecrets = projects.map(project => ({
    ...project,
    secrets: project.secrets.map(secret => ({
      ...secret,
      values: secret.values.map(v => ({
        ...v,
        value: decrypt(v.value),
      })),
    })),
  }))

  return projectsWithDecryptedSecrets
})
