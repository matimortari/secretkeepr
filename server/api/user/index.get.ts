import db from "#server/lib/db"
import { getUserFromSession } from "#server/lib/utils"

export default defineEventHandler(async (event) => {
  const sessionUser = await getUserFromSession(event)

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      memberships: {
        include: {
          organization: {
            include: {
              memberships: {
                include: { user: { omit: { cliToken: true } } },
              },
            },
          },
        },
      },
      projectMemberships: {
        include: {
          project: {
            include: {
              members: {
                select: {
                  role: true,
                  user: { omit: { cliToken: true } },
                },
              },
            },
          },
        },
      },
    },
  })
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" })
  }

  return user
})
