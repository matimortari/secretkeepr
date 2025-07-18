import db from "~/lib/db"
import { decrypt } from "~/lib/encryption"
import { getUserFromSession } from "~/lib/utils"

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
              name: true,
              email: true,
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
